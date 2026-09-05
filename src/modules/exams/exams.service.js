const ApiError = require('../../utils/ApiError');
const repo = require('./exams.repository');
const db = require('../../config/db');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function create(data) {
  const { class_ids, publish_now, ...examData } = data;

  if (class_ids && class_ids.length > 0) {
    const uniqueIds = [...new Set(class_ids)];
    const found = await db('classes')
      .whereIn('id', uniqueIds)
      .where('school_id', examData.school_id)
      .select('id');
    if (found.length !== uniqueIds.length) {
      throw new ApiError(400, 'Some classes were not found in your school');
    }
  }

  const exam = await db.transaction(async (trx) => {
    const [exam] = await trx('exams').insert({
      name: examData.name,
      exam_date: examData.exam_date || null,
      school_id: examData.school_id,
      is_published: publish_now || false,
    }).returning('*');

    if (class_ids && class_ids.length > 0) {
      const rows = class_ids.map((classId) => ({
        exam_id: exam.id,
        class_id: classId,
      }));
      await trx('exam_classes').insert(rows);
    }

    return exam;
  });

  const classes = await repo.findClasses(exam.id);
  return { ...exam, classes };
}

async function getById(id, schoolId) {
  const exam = await repo.findById(id, schoolId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  const classes = await repo.findClasses(id);
  return { ...exam, classes };
}

async function publish(id, isPublished, schoolId) {
  const exam = await getById(id, schoolId);

  if (isPublished) {
    const classes = await repo.findClasses(id);
    if (classes.length === 0) {
      throw new ApiError(400, 'Assign at least one class before publishing');
    }
  }

  return repo.update(id, { is_published: isPublished }, schoolId);
}

async function getClasses(examId, schoolId) {
  await getById(examId, schoolId);
  return repo.findClasses(examId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Exam deleted successfully' };
}

async function getSubjects(examId, schoolId) {
  await getById(examId, schoolId);
  return repo.findSubjects(examId);
}

async function addSubject(examId, data, schoolId) {
  await getById(examId, schoolId);
  return repo.upsertSubject(examId, data);
}

async function removeSubject(examId, subjectId, schoolId) {
  await getById(examId, schoolId);
  await repo.removeSubject(examId, subjectId);
  return { message: 'Subject removed from exam' };
}

module.exports = { list, create, getById, getClasses, publish, remove, getSubjects, addSubject, removeSubject };

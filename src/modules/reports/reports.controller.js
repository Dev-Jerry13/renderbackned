const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const service = require('./reports.service');

function sendJSON(res, data) {
  res.json(data);
}

async function sendExcel(res, data, sheetName, columns) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName || 'Report');

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: Math.max(c.header.length + 5, 20),
  }));

  const rows = Array.isArray(data) ? data : data.data || [];
  rows.forEach((row) => sheet.addRow(row));

  sheet.getRow(1).font = { bold: true, size: 12 };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${sheetName || 'report'}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

async function sendPDF(res, data, title, columns, rowMapper) {
  const doc = new PDFDocument({ margin: 40 });
  const rows = Array.isArray(data) ? data : data.data || [];

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${(title || 'report').replace(/\s+/g, '_').toLowerCase()}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(title || 'Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'right' });
  doc.moveDown();

  const tableTop = doc.y;
  const colWidths = columns.map(() => Math.max(70, Math.floor((doc.page.width - 80) / columns.length)));

  const drawHeader = () => {
    columns.forEach((col, i) => {
      const x = 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.fontSize(9).font('Helvetica-Bold').text(col.header, x, doc.y, {
        width: colWidths[i], align: 'left',
      });
    });
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.3);
  };

  drawHeader();

  rows.forEach((row, rowIndex) => {
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
      drawHeader();
    }

    const values = rowMapper ? rowMapper(row) : columns.map((c) => row[c.key] ?? '');
    values.forEach((val, i) => {
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
        drawHeader();
      }
      const x = 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.fontSize(8).font('Helvetica').text(String(val), x, doc.y, {
        width: colWidths[i], align: 'left',
        lineBreak: false,
      });
    });
    doc.moveDown(0.5);
  });

  doc.end();
}

function handleExport(req, res, next, reportFn, sheetName, columns, rowMapper) {
  return async () => {
    try {
      const { format = 'json' } = req.query;
      const data = await reportFn(req.user.schoolId, req.query);

      if (format === 'excel') {
        await sendExcel(res, data, sheetName, columns);
      } else if (format === 'pdf') {
        await sendPDF(res, data, sheetName, columns, rowMapper);
      } else {
        sendJSON(res, data);
      }
    } catch (err) {
      next(err);
    }
  };
}

async function studentStrength(req, res, next) {
  const fn = handleExport(req, res, next, service.studentStrengthReport, 'Student Strength', [
    { header: 'Class', key: 'class_name' },
    { header: 'Section', key: 'section' },
    { header: 'Total Students', key: 'total_students' },
    { header: 'Active', key: 'active_students' },
    { header: 'Inactive', key: 'inactive_students' },
  ]);
  await fn();
}

async function attendance(req, res, next) {
  const { group_by = 'student' } = req.query;
  const sheetName = group_by === 'class' ? 'Attendance by Class' : 'Attendance by Student';
  const columns = group_by === 'class'
    ? [
      { header: 'Class', key: 'class_name' },
      { header: 'Section', key: 'section' },
      { header: 'Total Records', key: 'total_records' },
      { header: 'Present', key: 'present_count' },
      { header: 'Absent', key: 'absent_count' },
      { header: 'Late', key: 'late_count' },
      { header: 'Attendance %', key: 'attendance_percentage' },
    ]
    : [
      { header: 'Student Name', key: 'student_name' },
      { header: 'Roll No', key: 'roll_number' },
      { header: 'Class', key: 'class_name' },
      { header: 'Section', key: 'section' },
      { header: 'Total Records', key: 'total_records' },
      { header: 'Present', key: 'present_count' },
      { header: 'Absent', key: 'absent_count' },
      { header: 'Late', key: 'late_count' },
      { header: 'Attendance %', key: 'attendance_percentage' },
    ];

  const fn = handleExport(req, res, next, (schoolId, query) =>
    service.attendanceReport(schoolId, { ...query, group_by }), sheetName, columns);
  await fn();
}

async function feeCollection(req, res, next) {
  const fn = handleExport(req, res, next, service.feeCollectionReport, 'Fee Collection', [
    { header: 'Class', key: 'class_name' },
    { header: 'Section', key: 'section' },
    { header: 'Fee Type', key: 'fee_type' },
    { header: 'Payment Count', key: 'payment_count' },
    { header: 'Total Collected', key: 'total_collected' },
  ]);
  await fn();
}

async function teacherWorkload(req, res, next) {
  const fn = handleExport(req, res, next, service.teacherWorkloadReport, 'Teacher Workload', [
    { header: 'Teacher Name', key: 'teacher_name' },
    { header: 'Phone', key: 'phone' },
    { header: 'Total Classes', key: 'total_classes' },
    { header: 'Total Subjects', key: 'total_subjects' },
  ], (row) => [
    row.teacher_name,
    row.phone || '-',
    row.total_classes,
    row.total_subjects,
  ]);
  await fn();
}

async function admissions(req, res, next) {
  const fn = handleExport(req, res, next, service.admissionsReport, 'Admissions', [
    { header: 'Date', key: 'date' },
    { header: 'Admissions Count', key: 'count' },
  ]);
  await fn();
}

module.exports = {
  studentStrength,
  attendance,
  feeCollection,
  teacherWorkload,
  admissions,
};

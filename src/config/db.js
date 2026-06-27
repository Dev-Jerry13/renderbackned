const pg = require('pg');
const knex = require('knex');
const config = require('../../knexfile');

pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

const db = knex(config.development);

module.exports = db;

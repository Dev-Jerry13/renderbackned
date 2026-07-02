const pg = require('pg');
const knex = require('knex');
const config = require('../../knexfile');
const env = require('./env');

pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

const environment = env.NODE_ENV || 'development';
const db = knex(config[environment] || config.development);

module.exports = db;

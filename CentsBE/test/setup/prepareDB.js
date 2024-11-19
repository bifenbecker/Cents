require('../testHelper');
const _ = require('lodash');
const Knex = require('knex');
const config = require('../../knexfile')[process.env.NODE_ENV];
config.connection.database = 'postgres';
let knex = Knex(config);

const prepareDB = async (knex) => {
    try {
        const result = await knex.raw(
            `SELECT * FROM pg_catalog.pg_database WHERE lower("datname") = lower('${process.env.DB_NAME}')`,
        );
        if (result.rows && result.rows.length) {
            await knex.raw(
                `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${process.env.DB_NAME}'`,
            );
            await knex.raw(`DROP DATABASE "${process.env.DB_NAME}"`);
            console.log('Dropped existing testing Database');
        }
        await knex.raw(`CREATE DATABASE ${process.env.DB_NAME}`);
    } catch (error) {
        console.log(error);
    } finally {
        config.connection.database = process.env.DB_NAME;
        knex = Knex(config);
        return knex;
    }
};

(async () => {
    knex = await prepareDB(knex);
    await knex.migrate.latest();
    console.log('Completed latest migrations:::::');
    process.exit(0);
})();

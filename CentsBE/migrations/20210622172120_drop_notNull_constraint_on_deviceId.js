exports.up = (knex) => {
    return knex.schema.alterTable('turns', (table) => {
        table.integer('deviceId').nullable().alter();
    });
};

exports.down = (knex) => {
    return knex.schema.alterTable('turns', (table) => {
        table.integer('deviceId').notNullable().alter();
    });
};

exports.up = (knex) => {
    return knex.schema.alterTable('machinePricing', (table) => {
        table.integer('loadId').nullable().alter();
    });
};

exports.down = (knex) => {
    return knex.schema.alterTable('machinePricing', (table) => {
        table.integer('loadId').notNullable().alter();
    });
};

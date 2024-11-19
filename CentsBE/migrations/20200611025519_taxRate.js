exports.up = function (knex) {
    return knex.schema.createTable('taxRates', function (table) {
        table.increments('id');
        table.string('taxAgency').nullable();
        table.string('name').nullable();
        table.float('rate').notNullable();
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('taxRates');
};

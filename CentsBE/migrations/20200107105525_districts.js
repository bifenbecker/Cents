exports.up = function (knex) {
    return knex.schema.createTable('districts', function (table) {
        table.increments('id');
        table.integer('regionId').notNullable();
        table.foreign('regionId').references('id').inTable('regions');
        table.string('name');
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('districts');
};

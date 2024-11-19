exports.up = function (knex) {
    return knex.schema.createTable('creditReasons', function (table) {
        table.increments('id');
        table.string('reason').notNullable();
        table.string('description').nullable();
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('creditReasons');
};

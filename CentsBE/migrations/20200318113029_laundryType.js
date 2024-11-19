exports.up = function (knex) {
    return knex.schema.createTable('laundryTypes', function (table) {
        table.increments('id');
        table.string('laundryType');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('laundryTypes');
};

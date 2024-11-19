exports.up = function (knex) {
    return knex.schema.createTable('services', function (table) {
        table.increments('id');
        table.string('service');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('services');
};

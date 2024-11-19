exports.up = function (knex) {
    return knex.schema.createTable('languages', function (table) {
        table.increments('id');
        table.string('language');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('languages');
};

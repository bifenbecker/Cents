exports.up = function (knex) {
    return knex.schema.createTable('machineLoadTypes', function (table) {
        table.increments('id');
        table.string('name');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machineLoadTypes');
};

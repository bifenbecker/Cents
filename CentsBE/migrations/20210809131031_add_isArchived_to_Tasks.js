exports.up = function (knex) {
    return knex.schema.alterTable('tasks', function (table) {
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('tasks', function (table) {
        table.timestamp('deletedAt');
    });
};

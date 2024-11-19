exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropUnique('email');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.unique('email');
    });
};

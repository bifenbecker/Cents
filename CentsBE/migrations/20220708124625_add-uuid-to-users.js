exports.up = function(knex) {
    return knex.schema.table('users', function (table) {
        table.uuid('uuid').defaultTo(knex.raw('uuid_generate_v4()'));
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('uuid');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.dropUnique('name');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.unique('name');
    });
};

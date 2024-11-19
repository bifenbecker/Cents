exports.up = function (knex) {
    return knex.schema.alterTable('machines', function (table) {
        table.dropUnique('serialNumber');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('machines', function (table) {
        table.unique('serialNumber');
    });
};

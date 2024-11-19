exports.up = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.string('status');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.dropColumn('status');
    });
};

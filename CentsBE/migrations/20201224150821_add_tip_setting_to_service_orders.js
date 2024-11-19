exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.string('tipOption');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('tipOption');
    });
};

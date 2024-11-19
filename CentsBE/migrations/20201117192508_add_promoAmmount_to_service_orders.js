exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.double('promotionAmount', 6, 2).defaultTo(0.0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('promotionAmount');
    });
};
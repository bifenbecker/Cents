exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.enu('orderType', ['SERVICE', 'RESIDENTIAL']).defaultTo('SERVICE');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('orderType');
    });
};

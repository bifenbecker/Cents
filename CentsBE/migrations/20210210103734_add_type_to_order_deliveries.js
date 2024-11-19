exports.up = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.enu('type', ['PICKUP', 'RETURN']).defaultTo('RETURN');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.dropColumn('type');
    });
};

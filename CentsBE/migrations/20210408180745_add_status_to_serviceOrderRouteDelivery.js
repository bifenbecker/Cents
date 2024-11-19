exports.up = function (knex) {
    return knex.schema.table('serviceOrderRouteDeliveries', function (table) {
        table.string('status');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderRouteDeliveries', function (table) {
        table.dropColumn('status');
    });
};

exports.up = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.string('trackingUrl');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.dropColumn('trackingUrl');
    });
};

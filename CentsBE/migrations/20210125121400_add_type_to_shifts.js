exports.up = function (knex) {
    return knex.schema.table('shifts', function (table) {
        table.enu('type', ['SHIFT', 'OWN_DELIVERY', 'CENTS_DELIVERY']).defaultTo('SHIFT');
    });
};

exports.down = function (knex) {
    return knex.schema.table('shifts', function (table) {
        table.dropColumn('type');
    });
};

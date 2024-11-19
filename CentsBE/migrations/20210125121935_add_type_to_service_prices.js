exports.up = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.enu('type', ['IN_STORE', 'DELIVERY']).defaultTo('IN_STORE');
    });
};

exports.down = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.dropColumn('type');
    });
};

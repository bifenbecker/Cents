exports.up = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.boolean('isDeliverable').defaultTo(false);
        table.dropColumn('type');
    });
};

exports.down = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.dropColumn('isDeliverable');
        table.enu('type', ['IN_STORE', 'DELIVERY']).defaultTo('IN_STORE');
    });
};

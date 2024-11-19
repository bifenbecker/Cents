exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.boolean('isAdjusted').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('isAdjusted');
    });
};

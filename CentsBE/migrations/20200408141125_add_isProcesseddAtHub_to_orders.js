exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.boolean('isProcessedAtHub').default(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('isProcessedAtHub');
    });
};

exports.up = function (knex) {
    return knex.schema.table('storeSettings', function (table) {
        table.boolean('deliveryEnabled').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('storeSettings', function (table) {
        table.dropColumn('deliveryEnabled');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.float('recurringDiscountInPercent').defaultTo(0.0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('storeSettings', function (table) {
        table.dropColumn('recurringDiscountInPercent');
    });
};

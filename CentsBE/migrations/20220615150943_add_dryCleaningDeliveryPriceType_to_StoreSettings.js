exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.enum('dryCleaningDeliveryPriceType', ['RETAIL', 'DELIVERY_TIER']).defaultTo('RETAIL');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('dryCleaningDeliveryPriceType');
    });
};


exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('deliveryTierServiceIds');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.specificType('deliveryTierServiceIds', 'integer[]');
    });
};

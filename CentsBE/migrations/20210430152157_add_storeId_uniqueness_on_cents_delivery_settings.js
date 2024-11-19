exports.up = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.unique('storeId');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.dropUnique('storeId');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('ownDeliverySettings', function (table) {
        table.unique('storeId');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('ownDeliverySettings', function (table) {
        table.dropUnique('storeId');
    });
};

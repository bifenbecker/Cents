const INVENTORY_ORDERS_TABLE_NAME = 'inventoryOrders';
const UNIQUE_ORDER_ID_COLUMN_NAME = 'uniqueOrderId';

exports.up = function (knex) {
    return knex.schema.alterTable(INVENTORY_ORDERS_TABLE_NAME, function (table) {
        table.string(UNIQUE_ORDER_ID_COLUMN_NAME).unique().defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable(INVENTORY_ORDERS_TABLE_NAME, function (table) {
        table.dropColumn(UNIQUE_ORDER_ID_COLUMN_NAME);
    });
};

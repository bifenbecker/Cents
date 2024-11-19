exports.up = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        // setting default price to 0
        table.float('price', 6, 2).defaultTo(0).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        // default precision is set to (8, 2).
        table.float('price').defaultTo(null).alter();
    });
};

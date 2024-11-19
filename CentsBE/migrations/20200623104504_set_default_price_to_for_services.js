exports.up = function (knex) {
    return knex.schema.alterTable('servicePrices', function (table) {
        // set default for storePrice column to 0.
        // setting precision to (6, 2).
        table.float('storePrice', 6, 2).defaultTo(0).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('servicePrices', function (table) {
        // default precision is set to (8, 2).
        table.float('storePrice').defaultTo(null).alter();
    });
};

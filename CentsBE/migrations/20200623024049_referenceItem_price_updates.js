exports.up = function (knex) {
    return knex.schema.alterTable('referenceItems', function (table) {
        table.renameColumn('price', 'totalPrice');
        table.float('quantity').alter();
        table.float('unitCost').defaultTo(0.0);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('referenceItems', function (table) {
        table.renameColumn('totalPrice', 'price');
        table.integer('quantity').alter();
        table.dropColumn('unitCost');
    });
};

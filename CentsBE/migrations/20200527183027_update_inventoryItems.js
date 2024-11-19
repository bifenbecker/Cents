exports.up = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.dropColumn('categoryId');
        table.dropColumn('name');
        table.integer('inventoryId');
        table.foreign('inventoryId').references('id').inTable('inventory');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.integer('categoryId');
        table.string('name');
        table.dropForeign('inventoryId');
        table.dropColumn('inventoryId');
    });
};

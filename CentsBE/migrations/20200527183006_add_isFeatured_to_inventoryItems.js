exports.up = function (knex) {
    return knex.schema.table('inventoryItems', function (table) {
        table.boolean('isFeatured').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventoryItems', function (table) {
        table.dropColumn('isFeatured');
    });
};

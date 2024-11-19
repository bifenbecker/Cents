exports.up = function (knex) {
    return knex.schema.table('inventory', function (table) {
        table.string('sku');
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventory', function (table) {
        table.dropColumn('sku');
    });
};

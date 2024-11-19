exports.up = function (knex) {
    return knex.schema.table('inventory', function (table) {
        table.boolean('isTaxable').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventory', function (table) {
        table.dropColumn('isTaxable');
    });
};

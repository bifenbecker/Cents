exports.up = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.boolean('isFeatured').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.table('servicePrices', function (table) {
        table.dropColumn('isFeatured');
    });
};

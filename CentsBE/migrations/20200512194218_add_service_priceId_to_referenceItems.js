exports.up = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.integer('servicePriceId');
        table.foreign('servicePriceId').references('id').inTable('servicePrices');
    });
};

exports.down = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.dropForeign('servicePriceId');
        table.dropColumn('servicePriceId');
    });
};

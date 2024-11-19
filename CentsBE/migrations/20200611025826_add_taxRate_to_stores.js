exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.integer('taxRateId').nullable();
        table.foreign('taxRateId').references('id').inTable('taxRates');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropForeign('taxRateId');
        table.dropColumn('taxRateId');
    });
};

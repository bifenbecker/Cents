exports.up = function (knex) {
    return knex.schema.table('prices', function (table) {
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
    });
};

exports.down = function (knex) {
    return knex.schema.table('prices', function (table) {
        table.dropForeign('storeId');
        table.dropColumn('storeId');
    });
};

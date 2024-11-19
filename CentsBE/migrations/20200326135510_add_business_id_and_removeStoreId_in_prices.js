exports.up = function (knex) {
    return knex.schema.table('prices', function (table) {
        table.dropColumn('storeId');
        table.integer('businessId');
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
    });
};

exports.down = function (knex) {
    return knex.schema.table('prices', function (table) {
        table.integer('storeId');
        table.dropColumn('businessId');
    });
};

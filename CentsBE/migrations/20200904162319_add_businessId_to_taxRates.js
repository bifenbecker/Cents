exports.up = function (knex) {
    return knex.schema.table('taxRates', function (table) {
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
    });
};

exports.down = function (knex) {
    return knex.schema.table('taxRates', function (table) {
        table.dropForeign('businessId');
        table.dropColumn('businessId');
    });
};

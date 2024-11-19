exports.up = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.integer('districtId');
        table.foreign('districtId').references('id').inTable('districts');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('districtId');
    });
};

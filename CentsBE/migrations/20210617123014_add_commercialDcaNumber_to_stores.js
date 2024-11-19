exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('commercialDcaLicense');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('commercialDcaLicense');
    });
};

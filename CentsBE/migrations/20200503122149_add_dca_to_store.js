exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('dcaLicense');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('dcaLicense');
    });
};

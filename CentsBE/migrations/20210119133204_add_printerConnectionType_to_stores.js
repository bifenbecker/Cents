exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('printerConnectionType').defaultTo('bluetooth');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('printerConnectionType');
    });
};

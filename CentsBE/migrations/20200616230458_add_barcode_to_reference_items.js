exports.up = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.string('barcode');
    });
};

exports.down = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.dropColumn('barcode');
    });
};

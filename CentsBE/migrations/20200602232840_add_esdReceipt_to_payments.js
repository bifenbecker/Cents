exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.string('esdReceiptNumber');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropColumn('esdReceiptNumber');
    });
};

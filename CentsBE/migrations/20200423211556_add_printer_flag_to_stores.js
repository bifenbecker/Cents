exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.boolean('hasReceiptPrinter').defaultTo('false');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('hasReceiptPrinter');
    });
};

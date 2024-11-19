exports.up = function (knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.string('receiptFooterMessage', 300).defaultTo('Thank you for your order.');
    });
};

exports.down = function (knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.dropColumn('receiptFooterMessage');
    });
};

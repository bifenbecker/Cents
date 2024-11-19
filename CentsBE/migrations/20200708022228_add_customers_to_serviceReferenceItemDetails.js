exports.up = function (knex) {
    return knex.schema.table('serviceReferenceItemDetails', function (table) {
        table.string('customerName');
        table.string('customerPhoneNumber');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceReferenceItemDetails', function (table) {
        table.dropColumn('customerName');
        table.dropColumn('customerPhoneNumber');
    });
};

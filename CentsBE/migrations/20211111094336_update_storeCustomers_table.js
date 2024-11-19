
exports.up = function(knex) {
    return knex.schema.table('storeCustomers', function (table) {
        table.boolean('isHangDrySelected').defaultTo(false);
        table.string('hangDryInstructions')
    });
};

exports.down = function(knex) {
    return knex.schema.table('storeCustomers', function (table) {
        table.dropColumn('isHangDrySelected');
        table.dropColumn('hangDryInstructions');
    });
};

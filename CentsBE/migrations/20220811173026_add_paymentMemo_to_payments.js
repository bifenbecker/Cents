exports.up = function(knex) {
    return knex.schema.table('payments', function (table) {
        table.text('paymentMemo').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('payments', function (table) {
        table.dropColumn('paymentMemo');
    });
};

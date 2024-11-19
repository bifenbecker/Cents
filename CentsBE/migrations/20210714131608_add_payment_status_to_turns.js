exports.up = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.enum('paymentStatus', ['PAID', 'BALANCE_DUE']).defaultTo('PAID');
    });
};

exports.down = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.dropColumn('paymentStatus');
    });
};

exports.up = function(knex) {
    return knex.schema.table('stores', function (table) {
        table.boolean('hasOtherPaymentMethods').default(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('hasOtherPaymentMethods');
    });
};

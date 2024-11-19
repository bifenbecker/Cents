exports.up = function (knex) {
    return knex.schema.table('centsCustomers', function (table) {
        table.string('stripeCustomerId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomers', function (table) {
        table.dropColumn('stripeCustomerId');
    });
};

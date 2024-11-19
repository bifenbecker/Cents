exports.up = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.string('stripeCustomerToken');
    });
};

exports.down = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.dropColumn('stripeCustomerToken');
    });
};

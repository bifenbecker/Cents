exports.up = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.string('subscriptionToken');
    });
};

exports.down = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.dropColumn('subscriptionToken');
    });
};

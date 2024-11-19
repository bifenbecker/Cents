exports.up = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.integer('subscriptionId'),
            table.foreign('subscriptionId').references('id').inTable('businessSubscriptions');
        table.dropColumn('subscriptionToken');
    });
};

exports.down = function (knex) {
    return knex.schema.table('laundromatBusiness', function (table) {
        table.string('subscriptionToken');
        table.dropForeign('subscriptionId');
        table.dropColumn('subscriptionId');
    });
};

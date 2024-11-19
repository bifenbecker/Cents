exports.up = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.integer('promotionAmountInCents').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.dropColumn('promotionAmountInCents');
    });
};

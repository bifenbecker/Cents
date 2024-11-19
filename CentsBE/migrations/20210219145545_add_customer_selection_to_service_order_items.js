exports.up = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.boolean('customerSelection').default(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.dropColumn('customerSelection');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.integer('subsidyInCents').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.dropColumn('subsidyInCents');
    });
};

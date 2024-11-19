exports.up = function (knex) {
    return knex.schema.alterTable('machines', function (table) {
        table.dropColumn('avgTurnsPerDay');
        table.dropColumn('avgRevenuePerDayInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('machines', function (table) {
        table.integer('avgTurnsPerDay');
        table.integer('avgRevenuePerDayInCents');
    });
};

exports.up = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.renameColumn('avgRevenuePerDay', 'avgRevenuePerDayInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.renameColumn('avgRevenuePerDayInCents', 'avgRevenuePerDay');
    });
};

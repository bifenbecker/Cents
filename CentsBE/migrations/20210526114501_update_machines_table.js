exports.up = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.integer('turnTimeInMinutes');
        table.integer('createdById');
        table.foreign('createdById').references('id').inTable('capturerData');
        table.integer('avgTurnsPerDay');
        table.integer('avgRevenuePerDay');
    });
};
exports.down = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.dropColumn('turnTimeInMinutes');
        table.dropColumn('createdById');
        table.dropColumn('avgTurnsPerDay');
        table.dropColumn('avgRevenuePerDay');
    });
};

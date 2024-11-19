exports.up = function (knex) {
    return knex.schema.createTable('machineTurnsStats', function (table) {
        table.increments('id');
        table.integer('avgTurnsPerDay');
        table.float('avgSelfServeRevenuePerDay', 6, 2);
        table.integer('machineId').notNullable().unique();
        table.foreign('machineId').references('id').inTable('machines');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machineTurnsStats');
};

exports.up = function (knex) {
    return knex.schema.table('machineTurnsStats', function (table) {
        table.float('avgTurnsPerDay').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.table('machineTurnsStats', function (table) {
        table.integer('avgTurnsPerDay').alter();
    });
};

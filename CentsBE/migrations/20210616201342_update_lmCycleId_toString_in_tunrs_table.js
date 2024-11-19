exports.up = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.string('lmCycleId').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.integer('lmCycleId').alter();
    });
};

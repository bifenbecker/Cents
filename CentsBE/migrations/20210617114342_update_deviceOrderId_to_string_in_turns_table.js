exports.up = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.string('deviceOrderId').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.table('turns', function (table) {
        table.integer('deviceOrderId').alter();
    });
};

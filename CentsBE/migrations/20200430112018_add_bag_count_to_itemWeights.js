exports.up = function (knex) {
    return knex.schema.table('itemWeights', function (table) {
        table.integer('bagCount');
        table.string('status');
    });
};

exports.down = function (knex) {
    return knex.schema.table('itemWeights', function (table) {
        table.dropColumn('bagCount');
        table.dropColumn('status');
    });
};

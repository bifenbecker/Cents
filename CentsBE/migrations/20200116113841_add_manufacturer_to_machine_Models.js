exports.up = function (knex) {
    return knex.schema.table('machineModels', function (table) {
        table.string('manufacturer');
    });
};

exports.down = function (knex) {
    return knex.schema.table('machineModels', function (table) {
        table.dropColumn('manufacturer');
    });
};

exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropColumn('tipAmount');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.float('tipAmount');
    });
};

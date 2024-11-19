exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.integer('employeeCode');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('employeeCode');
    });
};

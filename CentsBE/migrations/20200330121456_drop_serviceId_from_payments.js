exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropForeign('serviceId');
        table.dropColumn('serviceId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.integer('serviceId');
        table.foreign('serviceId').references('id').inTable('services');
    });
};

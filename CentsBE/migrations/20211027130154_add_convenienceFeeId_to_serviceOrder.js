exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('convenienceFeeId');
        table.foreign('convenienceFeeId').references('id').inTable('convenienceFees');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('convenienceFeeId');
    });
};

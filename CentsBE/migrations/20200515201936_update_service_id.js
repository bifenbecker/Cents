exports.up = function (knex) {
    return knex.schema.alterTable('orderItems', function (table) {
        table.dropForeign('serviceId'); // dropForeign key constraint
        table.dropColumn('serviceId');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderItems', function (table) {
        table.integer('serviceId');
        table.foreign('serviceId').references('id').inTable('services');
    });
};

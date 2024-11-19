exports.up = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.integer('serviceId');
        table.foreign('serviceId').references('id').inTable('servicesMaster');
    });
};

exports.down = function (knex) {
    return knex.schema.table('referenceItems', function (table) {
        table.dropForeign('serviceId');
        table.dropColumn('serviceId');
    });
};

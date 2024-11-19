exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrderBags', function (table) {
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderBags', function (table) {
        table.dropColumn('deletedAt');
    });
};

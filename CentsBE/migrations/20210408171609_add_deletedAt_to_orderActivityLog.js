exports.up = function (knex) {
    return knex.schema.alterTable('orderActivityLog', function (table) {
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderActivityLog', function (table) {
        table.dropColumn('deletedAt');
    });
};

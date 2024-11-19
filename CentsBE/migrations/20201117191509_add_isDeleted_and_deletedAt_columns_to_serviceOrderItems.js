exports.up = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.timestamp('deletedAt').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderItems', function (table) {
        table.dropColumn('deletedAt');
    });
};

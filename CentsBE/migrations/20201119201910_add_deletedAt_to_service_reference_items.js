exports.up = function (knex) {
    return knex.schema.table('serviceReferenceItems', function (table) {
        table.timestamp('deletedAt').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceReferenceItems', function (table) {
        table.dropColumn('deletedAt');
    });
};

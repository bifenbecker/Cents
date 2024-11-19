exports.up = function (knex) {
    return knex.schema.table('serviceReferenceItemDetails', function (table) {
        table.string('category');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceReferenceItemDetails', function (table) {
        table.dropColumn('category');
    });
};

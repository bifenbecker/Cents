exports.up = function (knex) {
    return knex.schema.table('laundryTypes', function (table) {
        table.string('category').defaultTo('FIXED_PRICE');
        table.text('description');
        table.boolean('isDeleted').defaultTo('false');
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('laundryTypes', function (table) {
        table.dropColumn('category');
        table.dropColumn('description');
        table.dropColumn('isDeleted');
        table.dropColumn('deletedAt');
    });
};

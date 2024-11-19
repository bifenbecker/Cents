exports.up = function (knex) {
    return knex.schema
        .alterTable('categories', function (table) {
            table.integer('businessId').notNullable();
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
            table.timestamp('deletedAt').nullable().defaultTo(null);
        })
        .renameTable('categories', 'inventoryCategories');
};

exports.down = function (knex) {
    return knex.schema
        .renameTable('inventoryCategories', 'categories')
        .alterTable('categories', function (table) {
            table.dropForeign('businessId');
            table.dropColumn('businessId');
            table.dropColumn('deletedAt');
        });
};

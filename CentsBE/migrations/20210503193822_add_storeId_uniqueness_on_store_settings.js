exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.unique('storeId');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropUnique('storeId');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.enum('tabletBrand', ['SAMSUNG', 'SUNMI']).defaultTo('SAMSUNG');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('tabletBrand');
    });
};

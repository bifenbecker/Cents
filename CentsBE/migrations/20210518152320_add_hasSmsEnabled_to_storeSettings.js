exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.boolean('hasSmsEnabled').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('hasSmsEnabled');
    });
};

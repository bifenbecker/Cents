exports.up = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.boolean('hasConvenienceFee').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.dropColumn('hasConvenienceFee');
    });
};

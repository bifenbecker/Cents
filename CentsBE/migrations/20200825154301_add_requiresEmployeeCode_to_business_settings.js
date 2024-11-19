exports.up = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.boolean('requiresEmployeeCode').defaultTo(true);
        table.boolean('requiresRack').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.dropColumn('requiresEmployeeCode');
        table.dropColumn('requiresRack');
    });
};

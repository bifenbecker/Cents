
exports.up = function(knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.boolean('isHangDryEnabled').defaultTo(false);
        table.boolean("isCustomPreferencesEnabled").defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.dropColumn('isHangDryEnabled');
        table.dropColumn('isCustomPreferencesEnabled');
    });
};

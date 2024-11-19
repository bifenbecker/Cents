
exports.up = function(knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.text('hangDryInstructions').defaultTo('');
    });
};

exports.down = function(knex) {
    return knex.schema.table('businessSettings', function (table) {
        table.dropColumn('hangDryInstructions');
    });
};

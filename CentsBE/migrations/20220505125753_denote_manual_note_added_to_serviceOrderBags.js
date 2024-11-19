exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrderBags', function (table) {
        table.boolean('manualNoteAdded').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrderBags', function (table) {
        table.dropColumn('manualNoteAdded');
    });
};

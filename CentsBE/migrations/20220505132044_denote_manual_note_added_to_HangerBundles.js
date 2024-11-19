exports.up = function (knex) {
    return knex.schema.alterTable('hangerBundles', function (table) {
        table.boolean('manualNoteAdded').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('hangerBundles', function (table) {
        table.dropColumn('manualNoteAdded');
    });
};

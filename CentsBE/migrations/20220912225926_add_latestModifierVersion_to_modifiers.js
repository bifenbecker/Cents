const MODIFIERS_TABLE_NAME = 'modifiers';
const LATEST_MODIFIER_VERSION_COL = 'latestModifierVersion';

exports.up = function (knex) {
    return knex.schema.alterTable(MODIFIERS_TABLE_NAME, function (table) {
        table.integer(LATEST_MODIFIER_VERSION_COL),
            table.foreign(LATEST_MODIFIER_VERSION_COL).references('id').inTable('modifierVersions');
    });
};

exports.down = function (knex) {
    return knex.schema.table(MODIFIERS_TABLE_NAME, function (table) {
        table.dropColumn(LATEST_MODIFIER_VERSION_COL);
    });
};

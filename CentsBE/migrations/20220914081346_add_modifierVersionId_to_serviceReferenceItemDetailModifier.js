const SERVICE_REFERENCE_ITEM_DETAIL_MODIFIER_TABLE_NAME = 'serviceReferenceItemDetailModifiers';
const MODIFIER_VERSION_ID = 'modifierVersionId';
const MODIFIER_VERSIONS_TABLE_NAME = 'modifierVersions';

exports.up = function (knex) {
    return knex.schema.alterTable(SERVICE_REFERENCE_ITEM_DETAIL_MODIFIER_TABLE_NAME, function (table) {
        table.integer(MODIFIER_VERSION_ID),
            table.foreign(MODIFIER_VERSION_ID).references('id').inTable(MODIFIER_VERSIONS_TABLE_NAME);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable(SERVICE_REFERENCE_ITEM_DETAIL_MODIFIER_TABLE_NAME, function (table) {
        table.dropColumn(MODIFIER_VERSION_ID);
    });
};
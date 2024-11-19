exports.up = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.renameColumn('firstLevelSubdivisonCode', 'firstLevelSubdivisionCode');
        table.string('thirdPartyDeliveryId').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.renameColumn('firstLevelSubdivisionCode', 'firstLevelSubdivisonCode');
        table.integer('thirdPartyDeliveryId').alter();
    });
};

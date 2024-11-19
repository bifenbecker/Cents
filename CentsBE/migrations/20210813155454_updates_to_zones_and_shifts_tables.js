exports.up = async function (knex) {
    await Promise.all([
        knex.schema.table('zones', function (table) {
            table.index(['ownDeliverySettingsId']);
            table.specificType('zipCodes', 'text[]').alter();
        }),
        knex.schema.table('shiftTimingZones', function (table) {
            table.index(['timingId']);
            table.dropColumn('deletedAt');
        }),
    ]);
};

exports.down = async function (knex) {
    await Promise.all([
        knex.schema.table('zones', function (table) {
            table.dropIndex(['ownDeliverySettingsId']);
            table.specificType('zipCodes', 'int[]').alter();
        }),
        knex.schema.table('shiftTimingZones', function (table) {
            table.dropIndex(['timingId']);
            table.timestamp('deletedAt').defaultTo(null);
        }),
    ]);
};

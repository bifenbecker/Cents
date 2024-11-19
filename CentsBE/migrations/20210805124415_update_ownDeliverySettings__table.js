exports.up = function (knex) {
    return knex.schema.alterTable('ownDeliverySettings', function (table) {
        table.boolean('hasZones').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('ownDeliverySettings', function (table) {
        table.dropColumn('hasZones');
    });
};

exports.up = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.dropColumn('isDeleted');
        table.integer('pairedById');
        table.foreign('pairedById').references('id').inTable('capturerData');
        table.integer('unPairedById');
        table.foreign('unPairedById').references('id').inTable('capturerData');
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.boolean('isDeleted');
        table.dropColumn('pairedById');
        table.dropColumn('unPairedById');
    });
};

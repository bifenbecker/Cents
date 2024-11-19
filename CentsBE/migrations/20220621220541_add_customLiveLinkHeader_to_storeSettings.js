exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.string('customLiveLinkHeader').defaultTo('How it works');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('customLiveLinkHeader');
    });
};

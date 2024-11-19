exports.up = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.dropColumn('runningStatus');
        table.dropColumn('status');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.string('runningStatus');
        table.string('status');
    });
};

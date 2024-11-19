exports.up = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.string('status');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.dropColumn('status');
    });
};

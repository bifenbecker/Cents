exports.up = function (knex) {
    return knex.schema.table('pairing', function (table) {
        table.string('runningStatus');
    });
};

exports.down = function (knex) {
    return knex.schema.table('pairing', function (table) {
        table.dropColumn('runningStatus');
    });
};

exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.renameColumn('squareLocationId', 'stripeLocationId');
        table.string('stripeTerminalId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.renameColumn('stripeLocationId', 'squareLocationId');
        table.dropColumn('stripeTerminalId');
    });
};

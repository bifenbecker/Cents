exports.up = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.string('origin');
        table.dropColumn('pairedById');
        table.dropColumn('unPairedById');
        table.integer('pairedByUserId');
        table.integer('unPairedByUserId');
        table.foreign('pairedByUserId').references('id').inTable('users');
        table.foreign('unPairedByUserId').references('id').inTable('users');
        table.dropColumn('isActive');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('pairing', function (table) {
        table.integer('pairedById');
        table.integer('unPairedById');
        table.dropColumn('origin');
        table.dropColumn('pairedByUserId');
        table.dropColumn('unPairedByUserId');
        table.boolean('isActive');
    });
};

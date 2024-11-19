exports.up = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.dropColumn('createdById');
        table.string('origin');
        table.integer('userId');
        table.foreign('userId').references('id').inTable('users');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.dropColumn('userId');
        table.dropColumn('origin');
        table.integer('createdById');
    });
};

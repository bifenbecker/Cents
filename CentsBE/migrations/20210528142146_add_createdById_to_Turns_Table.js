exports.up = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.integer('createdById');
        table.foreign('createdById').references('id').inTable('capturerData');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.dropColumn('createdById');
    });
};

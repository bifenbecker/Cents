exports.up = function (knex) {
    return knex.schema.table('promotionProgramItems', function (table) {
        table.boolean('isArchived').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('promotionProgramItems', function (table) {
        table.dropColumn('isArchived');
    });
};

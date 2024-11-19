exports.up = function (knex) {
    return knex.schema.table('serviceOrderWeights', function (table) {
        table.boolean('isEdited');
        table.integer('editedBy');
        table.foreign('editedBy').references('id').inTable('teamMembers');
        table.text('editReason');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderWeights', function (table) {
        table.dropColumn('isEdited');
        table.dropColumn('editedBy');
        table.dropColumn('editReason');
    });
};

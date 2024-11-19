exports.up = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.dropForeign('teamMemberId');
        table.dropColumn('teamMemberId');
    });
};

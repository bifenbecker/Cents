exports.up = function (knex) {
    return knex.schema.table('taskLogs', function (table) {
        table.dropForeign('taskId');
        table.dropColumn('taskId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('taskLogs', function (table) {
        table.integer('taskId');
        table.foreign('taskId').references('id').inTable('tasks');
    });
};

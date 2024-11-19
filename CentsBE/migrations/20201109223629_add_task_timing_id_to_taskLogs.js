exports.up = function (knex) {
    return knex.schema.table('taskLogs', function (table) {
        table.integer('taskTimingId');
        table.foreign('taskTimingId').references('id').inTable('taskTimings');
    });
};

exports.down = function (knex) {
    return knex.schema.table('taskLogs', function (table) {
        table.dropForeign('taskTimingId');
        table.dropColumn('taskTimingId');
    });
};

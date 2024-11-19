exports.up = function (knex) {
    return knex.schema.createTable('taskLogs', function (table) {
        table.increments('id');
        table.jsonb('taskDetails');
        table.string('notes');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.integer('taskId').notNullable();
        table.foreign('taskId').references('id').inTable('tasks');
        table.timestamp('completedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('taskLogs');
};

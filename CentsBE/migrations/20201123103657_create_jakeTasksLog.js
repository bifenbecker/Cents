exports.up = function (knex) {
    return knex.schema.createTable('jakeTasksLog', function (table) {
        table.increments('id');
        table.string('taskName').notNullable();
        table.timestamp('jobTimeStamp').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('jakeTasksLog');
};

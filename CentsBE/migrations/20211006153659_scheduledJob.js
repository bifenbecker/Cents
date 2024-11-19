exports.up = function (knex) {
    return knex.schema.createTable('scheduledJobs', function (table) {
        table.increments('id');
        table.string('queueName');
        table.integer('jobId').notNullable();
        table.timestamp('scheduledAt').notNullable();
        table.string('status');
        table.integer('scheduledJobForId').notNullable();
        table.string('scheduledJobForType').notNullable();
        table.string('jobType');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('scheduledJobs');
};

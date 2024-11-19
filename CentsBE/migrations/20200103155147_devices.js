exports.up = function (knex) {
    return knex.schema.createTable('devices', function (table) {
        table.increments('id');
        table.string('name').unique();
        table.integer('batchId');
        table.foreign('batchId').references('id').inTable('batches');
        table.boolean('isActive').defaultTo(true);
        table.text('privateKey').unique();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('devices');
};

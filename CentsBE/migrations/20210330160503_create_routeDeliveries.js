exports.up = function (knex) {
    return knex.schema.createTable('routeDeliveries', function (table) {
        table.increments('id');
        table.integer('routeId').notNullable();
        table.foreign('routeId').references('id').inTable('route');
        table.integer('routableId');
        table.string('routableType');
        table.string('status');
        table.string('notes').nullable();
        table.string('imageUrl');
        table.integer('stopNumber');
        table.bigInteger('eta');
        table.timestamp('startedAt');
        table.timestamp('completedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('routeDeliveries');
};

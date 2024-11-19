exports.up = function (knex) {
  return knex.schema.createTable('deliveryTimingSettings', function (table) {
    table.increments('id');
    table.integer('timingsId').notNullable();
    table.foreign('timingsId').references('id').inTable('timings');
    table.integer('maxStops').defaultTo(null);
    table.enu('serviceType', ['PICKUP', 'RETURN', 'ALL']).defaultTo('ALL');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('deliveryTimingSettings');
};

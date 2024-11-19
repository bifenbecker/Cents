exports.up = function (knex) {
    return knex.schema.createTable('scaleDevices', function (table) {
        table.increments('id');
        table.string('pinNumber').notNullable();
        table.string('deviceUuid').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('scaleDevices');
};

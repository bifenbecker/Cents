exports.up = function (knex) {
    return knex.schema.createTable('zones', function (table) {
        table.increments('id');
        table.integer('ownDeliverySettingsId').notNullable();
        table.foreign('ownDeliverySettingsId').references('id').inTable('ownDeliverySettings');
        table.string('name').unique();
        table.specificType('zipCodes', 'int[]');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt').defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('zones');
};

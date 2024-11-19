exports.up = function (knex) {
    return knex.schema.createTable('businessSettings', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.boolean('isWeightDuringIntake').defaultTo(true);
        table.boolean('isWeightBeforeProcessing').defaultTo(true);
        table.boolean('isWeightAfterProcessing').defaultTo(true);
        table.boolean('isWeightUpOnCompletion').defaultTo(true);
        table.boolean('isBagTrackingEnabled').defaultTo(false);
        table.boolean('isWeightReceivingAtStore').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businessSettings');
};

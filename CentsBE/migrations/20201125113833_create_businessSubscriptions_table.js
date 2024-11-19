exports.up = function (knex) {
    return knex.schema.createTable('businessSubscriptions', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable(),
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('stripeSubscriptionToken');
        table.string('status');
        table.boolean('isDeleted');
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businessSubscriptions');
};

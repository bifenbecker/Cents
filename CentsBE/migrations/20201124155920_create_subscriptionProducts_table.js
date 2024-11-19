exports.up = function (knex) {
    return knex.schema.createTable('subscriptionProducts', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('stripeProductId');
        table.string('stripePriceId');
        table.float('unitPrice');
        table.string('billingFrequency');
        table.string('name');
        table.integer('quantity');
        table.boolean('isDeleted').notNullable().defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('subscriptionProducts');
};

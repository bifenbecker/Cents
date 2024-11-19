exports.up = function (knex) {
    return knex.schema.createTable('orderPromoDetails', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.jsonb('promoDetails');
        table.specificType('itemIds', 'integer[]');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.string('orderableType');
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderPromoDetails');
};

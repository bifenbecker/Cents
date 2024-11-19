exports.up = function (knex) {
    return knex.schema.createTable('businessPromotionPrograms', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name').notNullable();
        table.string('promotionType').notNullable();
        table.string('currency').notNullable().defaultTo('USD');
        table.string('lightrailId');
        table.boolean('pretax');
        table.boolean('active');
        table.jsonb('balanceRule');
        table.jsonb('redemptionRule');
        table.integer('customerRedemptionLimit').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('startDate').defaultTo();
        table.timestamp('endDate').defaultTo();
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businessPromotionPrograms');
};

exports.up = function (knex) {
    return knex.schema.createTable('storePromotionPrograms', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('businessPromotionProgramId').notNullable();
        table
            .foreign('businessPromotionProgramId')
            .references('id')
            .inTable('businessPromotionPrograms');
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('storePromotionPrograms');
};

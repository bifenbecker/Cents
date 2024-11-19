exports.up = function (knex) {
    return knex.schema.createTable('promotionProgramItems', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('businessPromotionProgramId').notNullable();
        table
            .foreign('businessPromotionProgramId')
            .references('id')
            .inTable('businessPromotionPrograms');
        table.integer('promotionItemId').notNullable();
        table.string('promotionItemType').notNullable();
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('promotionProgramItems');
};

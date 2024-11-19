exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('promotionId');
        table.foreign('promotionId').references('id').inTable('businessPromotionPrograms');
        table.float('netOrderTotal');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('promotionId');
        table.dropColumn('netOrderTotal');
    });
};

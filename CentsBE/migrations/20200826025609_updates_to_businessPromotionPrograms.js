exports.up = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.integer('customerRedemptionLimit').nullable().alter();
        table.string('locationEligibilityType').notNullable();
        table.float('discountValue').notNullable();
        table.jsonb('activeDays').notNullable();
        table.string('appliesToType');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.integer('customerRedemptionLimit').notNullable().alter();
        table.dropColumn('locationEligibilityType');
        table.dropColumn('discountValue');
        table.dropColumn('activeDays');
        table.dropColumn('appliesToType');
    });
};

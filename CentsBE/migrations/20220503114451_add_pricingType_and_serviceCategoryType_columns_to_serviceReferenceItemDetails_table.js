exports.up = function (knex) {
    return knex.schema.alterTable('serviceReferenceItemDetails', function (table) {
        table.string('pricingType');
        table.string('serviceCategoryType');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceReferenceItemDetails', function (table) {
        table.dropColumn('pricingType');
        table.dropColumn('serviceCategoryType');
    });
};

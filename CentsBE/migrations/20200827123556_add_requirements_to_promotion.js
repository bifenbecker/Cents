exports.up = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.string('requirementType');
        table.integer('requirementValue');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.dropColumn('requirementType');
        table.dropColumn('requirementValue');
    });
};

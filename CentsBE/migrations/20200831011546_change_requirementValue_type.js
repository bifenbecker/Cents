exports.up = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.float('requirementValue').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessPromotionPrograms', function (table) {
        table.integer('requirementValue').alter();
    });
};

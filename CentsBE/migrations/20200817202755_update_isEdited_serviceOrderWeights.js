exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrderWeights', function (table) {
        table.boolean('isEdited').defaultTo(false).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrderWeights', function (table) {
        table.boolean('isEdited').defaultTo(null).alter();
    });
};

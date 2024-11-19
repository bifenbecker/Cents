exports.up = function (knex) {
    return knex.schema.table('serviceOrderWeights', function (table) {
        table.boolean('isAdjusted').defaultTo(false);
        table.integer('adjustedBy');
        table.foreign('adjustedBy').references('id').inTable('teamMembers');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderWeights', function (table) {
        table.dropForeign('adjustedBy');
        table.dropColumn('adjustedBy');
        table.dropColumn('isAdjusted');
    });
};

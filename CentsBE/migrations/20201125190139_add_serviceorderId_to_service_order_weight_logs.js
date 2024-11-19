exports.up = function (knex) {
    return knex.schema
        .table('serviceOrderWeights', function (table) {
            table.integer('serviceOrderId');
            table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        })
        .alterTable('serviceOrderWeights', function (table) {
            table.integer('referenceItemId').nullable().alter();
            table.dropForeign('referenceItemId');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('serviceOrderWeights', function (table) {
            table.dropForeign('serviceOrderId');
            table.dropColumn('serviceOrderId');
        })
        .alterTable('serviceOrderWeights', function (table) {
            table.foreign('referenceItemId').references('id').inTable('serviceReferenceItems');
        });
    // not adding notNullable constraint back, if there are null values then down will fail.
};

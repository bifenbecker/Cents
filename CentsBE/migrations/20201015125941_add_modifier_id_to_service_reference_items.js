exports.up = function (knex) {
    return knex.schema.table('serviceReferenceItems', function (table) {
        table.integer('serviceModifierId');
        table.foreign('serviceModifierId').references('id').inTable('serviceModifiers');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceReferenceItems', function (table) {
        table.dropForeign('serviceModifierId');
        table.dropColumn('serviceModifierId');
    });
};

exports.up = function (knex) {
    return knex.schema.renameTable('referenceItems', 'serviceReferenceItems');
};

exports.down = function (knex) {
    return knex.schema.renameTable('serviceReferenceItems', 'referenceItems');
};

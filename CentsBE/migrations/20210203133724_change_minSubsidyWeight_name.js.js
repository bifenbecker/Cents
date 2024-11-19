exports.up = function (knex) {
    return knex.schema.table('centsDeliverySettings', function (table) {
        table.renameColumn('minSubsidyWeight', 'minOrderAmountInCents');
        table.integer('minSubsidyWeight').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsDeliverySettings', function (table) {
        table.renameColumn('minOrderAmountInCents', 'minSubsidyWeight');
        table.float('minOrderAmountInCents').alter();
    });
};

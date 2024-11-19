exports.up = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.boolean('allowInStoreTip').defaultTo(false);
        table.string('termsOfServiceUrl');
        table.boolean('isCustomUrl').defaultTo(false);
        table.string('salesWeight');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessSettings', function (table) {
        table.dropColumn('allowInStoreTip');
        table.dropColumn('termsOfServiceUrl');
        table.dropColumn('salesWeight');
        table.dropColumn('isCustomUrl');
    });
};

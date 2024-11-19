exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table
            .string('customLiveLinkMessage', 300)
            .defaultTo(
                "Once we receive your order, we'll send you a text message to review and track it.",
            );
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('customLiveLinkMessage');
    });
};

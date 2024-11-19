exports.up = function (knex) {
    return knex.schema
        .raw('ALTER TABLE "storeThemes" NO INHERIT "businessThemes";')
        .then(() =>
            knex.schema.alterTable('storeThemes', function (table) {
                table.string('customUrl').defaultTo(null).unique();
            }),
        )
        .then(() =>
            knex.schema.alterTable('businessThemes', function (table) {
                table.string('customUrl').defaultTo(null).unique();
            }),
        );
};

exports.down = function (knex) {
    return knex.schema
        .alterTable('businessThemes', function (table) {
            table.dropColumn('customUrl');
        })
        .then(() =>
            knex.schema.alterTable('storeThemes', function (table) {
                table.dropColumn('customUrl');
            }),
        )
        .then(() => knex.schema.raw('ALTER TABLE "storeThemes" INHERIT "businessThemes";'));
};

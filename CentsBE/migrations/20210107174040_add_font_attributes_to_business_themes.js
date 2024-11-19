exports.up = function (knex) {
    return knex.schema.alterTable('businessThemes', function (table) {
        table
            .string('logoUrl')
            .defaultTo('https://cents-product-images.s3.us-east-2.amazonaws.com/Cents+LOGO.png')
            .alter();
        table.string('normalFont').defaultTo('Roboto Regular');
        table.string('boldFont').defaultTo('Roboto Bold');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('businessThemes', function (table) {
        table.dropColumn('normalFont');
        table.dropColumn('boldFont');
    });
};

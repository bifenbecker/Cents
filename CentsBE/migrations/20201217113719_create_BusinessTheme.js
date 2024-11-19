exports.up = function (knex) {
    return knex.schema.createTable('businessThemes', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('primaryColor').notNullable().defaultTo('#3D98FF');
        table.string('secondaryColor').notNullable().defaultTo('#FFFFFF');
        table.string('borderRadius').notNullable().defaultTo('31px');
        table
            .string('logoUrl')
            .notNullable()
            .defaultTo(
                'https://uploads-ssl.webflow.com/5f35b9852d3c6cbe4e3d4dd5/5f35be93b5fe6d50ea8fa1ea_Webclip.png',
            );
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businessThemes');
};

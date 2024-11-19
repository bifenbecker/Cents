exports.up = function (knex) {
    return knex.schema.createTable('termsOfServiceLog', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable(),
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.timestamp('signedAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('termsOfServiceLog');
};

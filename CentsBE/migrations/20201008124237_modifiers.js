exports.up = function (knex) {
    return knex.schema.createTable('modifiers', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable(),
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name');
        table.text('description');
        table.float('price', 6, 2);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('modifiers');
};

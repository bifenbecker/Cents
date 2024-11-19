exports.up = function (knex) {
    return knex.schema.createTable('tasks', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name').notNullable();
        table.string('description');
        table.boolean('isPhotoNeeded').defaultTo(false);
        table.string('url');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('tasks');
};

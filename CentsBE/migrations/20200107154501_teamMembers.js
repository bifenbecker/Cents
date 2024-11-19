exports.up = function (knex) {
    return knex.schema.createTable('teamMembers', function (table) {
        table.increments('id');
        table.string('birthday');
        table.string('employeeCode');
        table.string('role');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('userId').notNullable();
        table.foreign('userId').references('id').inTable('users');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('teamMembers');
};

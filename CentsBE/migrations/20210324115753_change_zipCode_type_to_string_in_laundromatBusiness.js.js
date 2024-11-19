exports.up = function (knex) {
    return knex.schema.alterTable('laundromatBusiness', function (table) {
        table.string('zipCode').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('laundromatBusiness', function (table) {
        table.integer('zipCode').alter();
    });
};

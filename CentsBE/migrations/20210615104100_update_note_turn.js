exports.up = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.text('note').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.string('note').alter();
    });
};

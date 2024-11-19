exports.up = function (knex) {
    return knex.schema.dropTableIfExists('capturerData');
};

exports.down = function (knex) {
    return;
};

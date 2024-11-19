exports.up = function (knex) {
  return knex.schema.alterTable('laundromatBusiness', function (table) {
    table.enum('type', ['LIVE', 'TEST']).defaultTo('LIVE');
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable('laundromatBusiness', function (table) {
    table.dropColumn('type');
  });
};

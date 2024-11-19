exports.up = function (knex) {
  return knex.schema.alterTable('servicesMaster', function (table) {
    table.integer('piecesCount');
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('servicesMaster', function (table) {
    table.dropColumn('piecesCount');
  })
};

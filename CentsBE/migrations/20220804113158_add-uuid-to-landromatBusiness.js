const LANDROMAT_BUSINESS_TABLE_NAME = 'laundromatBusiness';
const UUID_COLUMN_NAME = 'uuid';

exports.up = function(knex) {
  return knex.schema.table(LANDROMAT_BUSINESS_TABLE_NAME, function (table) {
      table.uuid(UUID_COLUMN_NAME).defaultTo(knex.raw('uuid_generate_v4()'));
  });
};

exports.down = function(knex) {
  return knex.schema.table(LANDROMAT_BUSINESS_TABLE_NAME, function (table) {
      table.dropColumn(UUID_COLUMN_NAME);
  });
};

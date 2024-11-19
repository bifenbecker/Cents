
exports.up = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.specificType('deliveryTierServiceIds', 'integer[]')
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('zones', function (table) {
        table.dropColumn('deliveryTierServiceIds');
    });
  };
  
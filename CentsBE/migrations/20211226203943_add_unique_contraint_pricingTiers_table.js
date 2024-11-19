exports.up = function (knex) {
    return knex.schema.alterTable('pricingTiers', function(table) {
         table.unique(['name', 'businessId', 'type', 'deletedAt']);
       });
 };
 
 exports.down = function (knex) {
     return knex.schema.alterTable('pricingTiers', function (table) {
         table.dropUnique(['name', 'businessId', 'type', 'deletedAt']);
     });
 };
 

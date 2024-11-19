
exports.up = function (knex) {
    return knex.schema.createTable('serviceReferenceItemDetailModifiers', function (table) {
        table.increments('id');
        table.integer('serviceReferenceItemDetailId').notNullable();
        table.foreign('serviceReferenceItemDetailId').references('id').inTable('serviceReferenceItemDetails');
        table.integer('modifierId').notNullable();
        table.foreign('modifierId').references('id').inTable('modifiers');
        table.string('modifierName').notNullable();
        table.float('unitCost').notNullable();
        table.float('quantity').notNullable();
        table.float('totalCost').notNullable();
        table.string('modifierPricingType').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceReferenceItemDetailModifiers');
  };

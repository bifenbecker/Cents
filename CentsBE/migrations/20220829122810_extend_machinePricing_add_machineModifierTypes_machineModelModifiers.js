exports.up = function (knex) {
    return knex.schema
        .createTable('machineModifierTypes', function (table) {
            table.increments('id');
            table.string('name').unique();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
        .createTable('machineModelModifiers', function (table) {
            table.increments('id');
            table.integer('modelId').notNullable();
            table.foreign('modelId').references('id').inTable('machineModels');
            table.integer('machineModifierTypeId').notNullable();
            table.foreign('machineModifierTypeId').references('id').inTable('machineModifierTypes');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
        .alterTable('machinePricing', function (table) {
            table.enum('type', ['BASE_VEND', 'LOAD_TEMPERATURE', 'MACHINE_MODIFIER', 'TOP_OFF', 'TOP_OFF_FULL_CYCLE']).defaultTo('BASE_VEND');
            table.integer('modifierId').defaultTo(null);
            table.foreign('modifierId').references('id').inTable('machineModelModifiers');
        })
        .raw(`
            UPDATE "machinePricing"
            SET type=(
                CASE
                    WHEN ("machinePricing"."loadId" IS NULL AND "machinePricing"."modifierId" IS NULL) THEN 'BASE_VEND'
                    WHEN ("machinePricing"."loadId" IS NOT NULL) THEN 'LOAD_TEMPERATURE'
                    WHEN ("machinePricing"."modifierId" IS NOT NULL) THEN 'MACHINE_MODIFIER'
                END
            );
        `)
};

exports.down = function (knex) {
    return knex.schema
        .alterTable('machinePricing', function (table) {
            table.dropColumn('type');
            table.dropColumn('modifierId');
        })
        .dropTableIfExists('machineModelModifiers')
        .dropTableIfExists('machineModifierTypes')
};
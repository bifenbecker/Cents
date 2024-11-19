
exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE "storeSettings" DROP CONSTRAINT "storeSettings_tabletBrand_check";
        ALTER TABLE "storeSettings" ADD CONSTRAINT "storeSettings_tabletBrand_check" CHECK ("tabletBrand" IN ('SAMSUNG'::text, 'SUNMI_T2S'::text, 'SUNMI_T2S_LITE'::text));
    `);
};

exports.down = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE "storeSettings" DROP CONSTRAINT "storeSettings_tabletBrand_check";
        ALTER TABLE "storeSettings" ADD CONSTRAINT "storeSettings_tabletBrand_check" CHECK ("tabletBrand" IN ('SAMSUNG'::text, 'SUNMI'::text));
    `);
};

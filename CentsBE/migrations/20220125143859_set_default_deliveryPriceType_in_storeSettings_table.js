exports.up = function (knex) {

    const query = `UPDATE "storeSettings"
                   SET "deliveryPriceType" = 'RETAIL'
                   WHERE "deliveryPriceType" IS NULL;`

    return knex.raw(query);
};
  
exports.down = function (knex) {
  
    const query = `UPDATE "storeSettings"
                   SET "deliveryPriceType" = null
                   WHERE "deliveryPriceType" = 'RETAIL'`
  
    return knex.raw(query);
};
  
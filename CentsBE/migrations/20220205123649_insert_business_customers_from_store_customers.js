
exports.up = function(knex) {
  
    const query = `INSERT INTO "businessCustomers" ("centsCustomerId","businessId", "storeIds", "creditAmount")
    SELECT "centsCustomerId","businessId", array_agg("storeId") AS storeIds, "creditAmount"
    FROM "storeCustomers" GROUP BY "centsCustomerId", "businessId","creditAmount"`
    return knex.raw(query);
};

exports.down = function(knex) {
    return;
};

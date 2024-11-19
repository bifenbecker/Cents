const InventoryCategory = require('../../models/inventoryCategory');

const addNewProductWIthPrices = async (payload) => {
    const newPayload = payload;
    const { id, transaction, businessId } = newPayload;

    let products = await InventoryCategory.query(transaction)
        .knex()
        .raw(
            `SELECT NULL AS id, "inventory"."productName", "inventory"."productImage", "inventory"."description",
                0 AS price, FALSE AS "isFeatured", "inventory"."id" AS "inventoryId"
        FROM "inventory"
            INNER JOIN "inventoryCategories" ON "inventoryCategories".id = "inventory"."categoryId"
            LEFT OUTER JOIN "inventoryItems" ON "inventoryItems"."inventoryId" = "inventory".id 
            AND "inventoryItems"."storeId" IS NULL AND "inventoryItems"."pricingTierId" = ${id}
        WHERE "inventory"."deletedAt" IS NULL AND "inventoryItems".id IS NULL AND "inventoryCategories"."businessId" = ${businessId}`,
        );

    products = products.rows.length ? products.rows : null;
    if (products) newPayload.products.push(...products);

    return newPayload;
};
module.exports = exports = addNewProductWIthPrices;

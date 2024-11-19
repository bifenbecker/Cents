SELECT
    "serviceOrInventoryOrders".*,
    "centsCustomers"."firstName" || ' ' || "centsCustomers"."lastName" AS "fullName",
    "storeCustomers"."firstName" || ' ' || "storeCustomers"."lastName" AS "boFullName",
    orders.id AS "orderId",
    orders."orderableId" AS "orderableId",
    orders."orderableType" AS "orderableType",
    COUNT(orders.id) OVER() AS "total_count"
FROM
    "orders"
    INNER JOIN (
        SELECT
            "serviceOrders"."id",
            "stores"."name" AS "storeName",
            "stores".address AS "storeAddress",
            "serviceOrders"."placedAt" AS "placedAt",
            "serviceOrders"."status",
            "serviceOrders"."completedAt" AS "completedAt",
            "serviceOrders"."netOrderTotal",
            stores.id AS "storeId",
            "serviceOrders"."orderTotal",
            "serviceOrders"."orderCode",
            "serviceOrders"."orderType",
            'ServiceOrder' AS "orderableType",
            "serviceOrders"."storeCustomerId"
        FROM
            "serviceOrders"
            JOIN stores ON stores.id = "serviceOrders"."storeId"
        WHERE
            stores.id IN ({{stores}})
            {{#fetchActive}}
            AND "serviceOrders".status NOT IN ('COMPLETED', 'CANCELLED')
            {{/fetchActive}}
            {{^fetchActive}}
            AND "serviceOrders".status IN ('COMPLETED', 'CANCELLED')
            {{/fetchActive}}
        UNION
        SELECT
            "inventoryOrders".id AS id,
            "stores"."name" AS "storeName",
            "stores".address AS "storeAddress",
            "inventoryOrders"."createdAt" AS "placedAt",
            "inventoryOrders"."status",
            CASE
                WHEN status = 'COMPLETED' THEN "inventoryOrders"."updatedAt"
                ELSE null
            END AS "completedAt",
            "inventoryOrders"."netOrderTotal" AS "netOrderTotal",
            stores.id AS "storeId",
            "inventoryOrders"."orderTotal" AS "orderTotal",
            "inventoryOrders"."orderCode" AS "orderCode",
            'INVENTORY' AS "orderType",
            'InventoryOrder' AS "orderableType",
            "inventoryOrders"."storeCustomerId"
        FROM
            "inventoryOrders"
            JOIN stores ON stores.id = "inventoryOrders"."storeId"
        WHERE
            stores.id IN ({{stores}})
            {{#fetchActive}}
            AND "inventoryOrders".status NOT IN ('COMPLETED', 'CANCELLED')
            {{/fetchActive}}
            {{^fetchActive}}
            AND "inventoryOrders".status IN ('COMPLETED', 'CANCELLED')
            {{/fetchActive}}
    ) AS "serviceOrInventoryOrders" ON orders."orderableId" = "serviceOrInventoryOrders".id
    AND orders."orderableType" = "serviceOrInventoryOrders"."orderableType"
    LEFT JOIN "storeCustomers" ON "storeCustomers".id = "serviceOrInventoryOrders"."storeCustomerId"
    LEFT JOIN "centsCustomers" ON "centsCustomers".id = "storeCustomers"."centsCustomerId"
{{#keyword}}
WHERE (
    "serviceOrInventoryOrders"."orderCode" ILIKE '%{{keyword}}%' OR
    CONCAT("storeCustomers"."firstName", ' ', "storeCustomers"."lastName") ILIKE '%{{keyword}}%' OR
    CONCAT("centsCustomers"."firstName", ' ', "centsCustomers"."lastName") ILIKE '%{{keyword}}%' OR
    "storeCustomers".email ILIKE '%{{keyword}}%' OR
    "centsCustomers".email ILIKE '%{{keyword}}%' OR
    "centsCustomers"."phoneNumber" ILIKE '%{{keyword}}%' OR
    "storeCustomers"."phoneNumber" ILIKE '%{{keyword}}%'
)
{{/keyword}}
ORDER BY orders.id DESC
OFFSET {{ordersOffset}}
LIMIT {{ordersLimit}}
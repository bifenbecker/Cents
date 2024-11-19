SELECT
    "serviceOrInventoryOrders".*,
    "centsCustomers"."firstName" || ' ' || "centsCustomers"."lastName" AS "fullName",
    orders.id AS "orderId",
    orders."orderableId" AS "orderableId",
    orders."orderableType" AS "orderableType",
    COUNT(orders.id) OVER() AS "total_count",
    "orderDeliveries"."deliveryDetails" as delivery
FROM
    "orders"
    INNER JOIN (
        SELECT
            "serviceOrders"."id",
            "stores"."name" AS "storeName",
            "serviceOrders"."placedAt" AS "placedAt",
            "serviceOrders"."status",
            "serviceOrders"."paymentStatus",
            stores.id AS "storeId",
            "serviceOrders"."orderCode"::INT AS "orderCode",
            "serviceOrders"."orderType",
            'ServiceOrder' AS "orderableType",
            "serviceOrders"."storeCustomerId",
            COUNT(distinct "serviceOrderBags"."id") as "bagCount",
            json_agg(
                json_build_object(
                    'id', "serviceOrderBags".id,
                    'notes', "serviceOrderBags"."notes"
                )
            ) AS "serviceOrderBags"
        FROM
            "serviceOrders"
            JOIN stores ON stores.id = "serviceOrders"."storeId"
            LEFT JOIN "serviceOrderBags" ON "serviceOrderBags"."serviceOrderId" = "serviceOrders".id
        WHERE
            stores.id IN ({{stores}})
            AND "serviceOrders".status IN (
                {{#statusesMap}}
                    '{{name}}'{{^last}},{{/last}}
                {{/statusesMap}}
            )
        GROUP BY "serviceOrders".id, "stores"."name", "stores".id
        {{#completedOrders}}
            UNION ALL
            SELECT
                "inventoryOrders".id AS id,
                "stores"."name" AS "storeName",
                "inventoryOrders"."createdAt" AS "placedAt",
                "inventoryOrders"."status",
                "inventoryOrders"."paymentStatus",
                stores.id AS "storeId",
                "inventoryOrders"."orderCode"::INT AS "orderCode",
                'INVENTORY' AS "orderType",
                'InventoryOrder' AS "orderableType",
                "inventoryOrders"."storeCustomerId",
                COUNT(distinct "inventoryOrderLineItems"."id") as "bagCount",
                json_agg(
                    json_build_object(
                        'id', "inventoryOrderLineItems".id
                    )
                ) AS "serviceOrderBags"
            FROM
                "inventoryOrders"
                JOIN stores ON stores.id = "inventoryOrders"."storeId"
                JOIN "inventoryOrderLineItems" ON "inventoryOrderLineItems"."inventoryOrderId" = "inventoryOrders".id
            WHERE
                stores.id IN ({{stores}})
                AND "inventoryOrders".status IN ('COMPLETED', 'CANCELLED')
            GROUP BY "inventoryOrders".id, "stores"."name", "stores".id
        {{/completedOrders}}
    ) AS "serviceOrInventoryOrders" ON orders."orderableId" = "serviceOrInventoryOrders".id
    AND orders."orderableType" = "serviceOrInventoryOrders"."orderableType"
    LEFT JOIN "storeCustomers" ON "storeCustomers".id = "serviceOrInventoryOrders"."storeCustomerId"
    LEFT JOIN "centsCustomers" ON "centsCustomers".id = "storeCustomers"."centsCustomerId"
    LEFT JOIN (select "orderId", jsonb_build_object(
        'id', "orderDeliveries".id
    ) as "deliveryDetails" from "orderDeliveries" where type = 'RETURN' and status not in ('FAILED','CANCELED')) as "orderDeliveries" on "orderDeliveries"."orderId" = orders.id
{{#keyword}}
WHERE (
    "serviceOrInventoryOrders"."orderCode"::TEXT ILIKE '%{{keyword}}%' OR
    CONCAT("storeCustomers"."firstName", ' ', "storeCustomers"."lastName") ILIKE '%{{keyword}}%' OR
    CONCAT("centsCustomers"."firstName", ' ', "centsCustomers"."lastName") ILIKE '%{{keyword}}%' OR
    "storeCustomers".email ILIKE '%{{keyword}}%' OR
    "centsCustomers".email ILIKE '%{{keyword}}%' OR
    "centsCustomers"."phoneNumber" ILIKE '%{{keyword}}%' OR
    "storeCustomers"."phoneNumber" ILIKE '%{{keyword}}%'
)
{{/keyword}}
ORDER BY {{#sortRelation}} "serviceOrInventoryOrders".{{/sortRelation}}"{{sortBy}}" {{sortOrder}}
OFFSET {{ordersOffset}}
LIMIT {{ordersLimit}}

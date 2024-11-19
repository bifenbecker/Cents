WITH customer_orders AS (
    SELECT
            "serviceOrders".id AS "id",
            "serviceOrders".status AS "status",
            "serviceOrders"."storeId" AS "storeId",
            CASE WHEN "netOrderTotal" = 'NaN' THEN 0 ELSE "netOrderTotal" END AS "netOrderTotal",
            "placedAt" AS "placedAt",
            "orderCode"::INT AS "orderCode",
            "storeCustomers"."centsCustomerId"
        FROM "serviceOrders"
        INNER JOIN "storeCustomers" ON "storeCustomers".id = "serviceOrders"."storeCustomerId"
        INNER JOIN "centsCustomers" ON "centsCustomers".id = "storeCustomers"."centsCustomerId"
        WHERE "storeCustomers"."businessId" = {{businessId}} and "storeCustomers"."centsCustomerId" = {{id}}
        
        UNION
        
        SELECT
            "inventoryOrders".id,
            "inventoryOrders".status,
            "inventoryOrders"."storeId",
            "netOrderTotal",
            "inventoryOrders"."createdAt",
            "orderCode"::INT,
            "storeCustomers"."centsCustomerId"
        FROM "inventoryOrders"
        INNER JOIN "storeCustomers" ON "storeCustomers".id = "inventoryOrders"."storeCustomerId"
        INNER JOIN "centsCustomers" ON "centsCustomers".id = "storeCustomers"."centsCustomerId"
        WHERE "storeCustomers"."businessId" = {{businessId}} and "storeCustomers"."centsCustomerId" = {{id}}
    ),
    recent_order AS (
        SELECT status, id, "orderCode", "centsCustomerId", "placedAt" FROM "customer_orders" where "orderCode" = (SELECT MAX("orderCode") FROM customer_orders)
    ),
    stats AS (
        SELECT SUM(CASE WHEN status <> 'CANCELLED' 
                    THEN COALESCE("netOrderTotal", 0) 
                    ELSE 0 END) AS totalSpend,
            COUNT(customer_orders.id) AS "totalOrders",
            MAX("centsCustomerId") AS "centsCustomerId"
            FROM customer_orders
    ),
    stores_info AS(
        SELECT stores.id, stores.name, stores.address, "centsCustomerId", COUNT(customer_orders."id") AS visits FROM stores
        INNER JOIN customer_orders ON "stores".id = customer_orders."storeId"
        GROUP BY stores.id, stores.name, "centsCustomerId"
    ),
    aggregated_stores_info AS(
        SELECT ARRAY_AGG(json_build_object('id', stores_info.id, 'name', stores_info.name, 'visits', stores_info.visits, 'address', stores_info.address)) AS store_details, "centsCustomerId"
        FROM stores_info
        GROUP BY "centsCustomerId"
        
    )
    SELECT totalspend, recent_order."placedAt" AS "lastOrderDate", recent_order.id AS "lastOrderId", recent_order.status AS "lastOrderStatus", recent_order."orderCode" AS "lastOrderCode", "totalOrders", aggregated_stores_info.store_details as "stores" FROM stats
    INNER JOIN aggregated_stores_info ON aggregated_stores_info."centsCustomerId" = stats."centsCustomerId"
    INNER JOIN recent_order ON recent_order."centsCustomerId" = stats."centsCustomerId"
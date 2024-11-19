WITH "filteredBusinessCustomers" AS(
    SELECT bc.id, TRIM(CONCAT(cc."firstName",' ', cc."lastName")) AS "fullName", 
    cc."phoneNumber", cc."email", cc."stripeCustomerId",
    coalesce((bc."isCommercial"), false) as "isCommercial",
    coalesce((bc."isInvoicingEnabled"), false) as "isInvoicingEnabled",
    bc."businessId",
    bc."centsCustomerId"
    FROM "businessCustomers" bc
    INNER JOIN "centsCustomers" cc ON "cc".id="bc"."centsCustomerId"
    WHERE bc."deletedAt" IS NULL
    {{#businessCustomerId}}
        AND bc.id = {{businessCustomerId}}
    {{/businessCustomerId}}
    ORDER BY bc.id DESC
    {{#limit}}
        LIMIT {{limit}} offset {{offset}}
    {{/limit}}
), "storeCustomersWithOrders" AS (
    SELECT "filteredBusinessCustomers".id AS "businessCustomerId",
    array_agg(
        sc."storeId"
    ) AS "storeIds",
    json_agg(
	    json_build_object(
	    	'id', sc.id,
	    	'storeId', sc."storeId",
	    	'hangDrySelected', sc."isHangDrySelected",
	    	'hangDryInstructions', sc."hangDryInstructions",
            'availableCredit', sc."creditAmount",
            'languageId', sc."languageId",
            'notes', sc."notes",
	    	'order', json_build_object(
	    		'orderId',recent_order_query."orderId",
	    		'orderCode', recent_order_query."orderCode",
	    		'status', recent_order_query."status",
                'orderableType', recent_order_query."orderableType",
                'isActive', recent_order_query."isActive"
	    	)
	    ) 
    ) AS "storeCustomers"
    FROM "storeCustomers" sc
    INNER JOIN "filteredBusinessCustomers" ON "filteredBusinessCustomers".id = sc."businessCustomerId"
    LEFT JOIN LATERAL (
        SELECT * FROM ((select "serviceOrders"."orderCode" AS "orderCode", "serviceOrders"."status",
        "serviceOrders"."id" AS "orderId", 'ServiceOrder' AS "orderableType",
        "serviceOrders"."storeCustomerId", "serviceOrders"."createdAt",
        CASE WHEN "serviceOrders".status NOT IN ('COMPLETED', 'CANCELLED', 'CANCELED') THEN TRUE ELSE FALSE END
        AS "isActive"
        FROM "serviceOrders"
        WHERE "serviceOrders"."storeCustomerId" = "sc"."id" ORDER BY "orderCode" DESC LIMIT 1)
            UNION  
        SELECT "inventoryOrders"."orderCode" AS "orderCode", "inventoryOrders"."status",
        "inventoryOrders"."id" AS "orderId", 'InventoryOrder' AS "orderableType",
        "inventoryOrders"."storeCustomerId", "inventoryOrders"."createdAt",
        CASE WHEN "inventoryOrders".status NOT IN ('COMPLETED', 'CANCELLED', 'CANCELED') THEN TRUE ELSE FALSE END
        AS "isActive"
        FROM "inventoryOrders" 
        WHERE 
        "inventoryOrders"."storeCustomerId" = "sc"."id" ORDER BY "orderCode" DESC LIMIT 1
        ) AS orders_query ORDER BY "createdAt" DESC LIMIT 1
    ) recent_order_query ON TRUE
    GROUP BY "filteredBusinessCustomers".id
)
SELECT * FROM "filteredBusinessCustomers"
LEFT JOIN "storeCustomersWithOrders" on "filteredBusinessCustomers".id = "storeCustomersWithOrders"."businessCustomerId"
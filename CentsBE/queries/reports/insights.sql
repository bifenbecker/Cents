SELECT
	SUM(sub."totalOrderValue") as "totalOrdersValue",
	SUM(sub."totalOrders") AS "totalOrders" ,
	ROUND((CASE
		WHEN SUM(sub."totalOrders") > 0 THEN (SUM(sub."totalOrderValue")/SUM(sub."totalOrders"))
		ELSE 0
	END)::NUMERIC, 2)::FLOAT AS "averageOrderValue"
FROM (
	SELECT
		COALESCE(
			SUM(
				CASE WHEN COALESCE("netOrderTotal", 0) = 'NaN' THEN 0 ELSE COALESCE("netOrderTotal", 0) END
				+ CASE WHEN COALESCE("creditAmount", 0) = 'NaN' THEN 0 ELSE COALESCE("creditAmount", 0) END
			)
		, 0) AS "totalOrderValue",
		COUNT("serviceOrders"."id") AS "totalOrders"
	FROM "serviceOrders"
	INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "serviceOrders"."storeId"
	WHERE
		"status" NOT IN ('CANCELLED', 'CANCELED')
		AND "serviceOrders"."storeId" IN ({{stores}})
		AND CAST("placedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) >= CAST(date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE "storeSettings"."timeZone") AS DATE)

	UNION

	SELECT
		COALESCE(
			SUM(
				CASE WHEN COALESCE("netOrderTotal", 0) = 'NaN' THEN 0 ELSE COALESCE("netOrderTotal", 0) END
				+ CASE WHEN COALESCE("creditAmount", 0) = 'NaN' THEN 0 ELSE COALESCE("creditAmount", 0) END
			)
		, 0) AS "totalOrderValue",
		COUNT("inventoryOrders"."id") AS "totalOrders"
	FROM "inventoryOrders"
	INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "inventoryOrders"."storeId"
	WHERE
		"status" IN ('COMPLETED')
    	AND "inventoryOrders"."storeId" IN ({{stores}})
		AND CAST("createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) >= CAST(date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE "storeSettings"."timeZone") AS DATE)
) AS sub

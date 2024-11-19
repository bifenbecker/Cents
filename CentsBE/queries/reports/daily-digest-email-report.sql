
SELECT dailyReports.*
FROM (
			SELECT 
				lob.id, 
				u."email", 
				lob."name",
		 	-- Orders due today
			(	
				SELECT COALESCE(COUNT(so.id), 0)
				FROM "serviceOrders" so 
				INNER JOIN "stores" s ON so."storeId" = s."id"
				WHERE s."businessId" = lob.id 
				AND DATE(timezone(ss."timeZone", so."placedAt" + interval '1 hour' * COALESCE(so."turnAroundInHours", 0))) = '{{today}}' 
				AND so."status" NOT IN ('CANCELLED', 'COMPLETED')
			) AS "ordersCountDueToday",
			-- Pounds due today
			(	
				SELECT COALESCE(ROUND(SUM(poundsDueToday."chargeableWeight")::numeric, 2), 0)
				FROM (
							SELECT sow."chargeableWeight"
							FROM "serviceOrders" so 
							INNER JOIN "stores" s ON so."storeId" = s."id"
							INNER JOIN "serviceOrderWeights" sow ON sow."serviceOrderId" = so.id
							WHERE s."businessId" = lob.id
							AND DATE(timezone(ss."timeZone", so."placedAt" + interval '1 hour' * COALESCE(so."turnAroundInHours", 0))) = '{{today}}'  
							AND so."status" NOT IN ('CANCELLED', 'COMPLETED')
							GROUP BY so.id, sow."chargeableWeight"
						 ) AS poundsDueToday
			) AS "poundsDueToday",
			-- Total pounds processed
			(
				SELECT COALESCE(ROUND(SUM(processedweights."chargeableWeight")::numeric, 2), 0)
				FROM (
							SELECT sow."chargeableWeight" 
							FROM "orderActivityLog" oal 
							INNER JOIN "serviceOrders" so ON oal."orderId" = so.id
							INNER JOIN "serviceOrderWeights" sow ON sow."serviceOrderId" = so.id 
							INNER JOIN "stores" s ON s."id" = so."storeId"
							WHERE oal."status" IN ('READY_FOR_PICKUP', 'READY_FOR_DRIVER_PICKUP') 
							AND DATE(timezone(ss."timeZone", oal."updatedAt")) = '{{yesterday}}' 
							AND s."businessId" = lob.id 
							GROUP BY so.id, sow."chargeableWeight"
						 ) AS processedweights
			) AS "lbsProcessed",
			-- Total pounds unprocessed
			(
				SELECT COALESCE(ROUND(SUM(unprocessedWeights."chargeableWeight")::numeric, 2), 0) 
				FROM (
							SELECT  sow."chargeableWeight"
							FROM "orderActivityLog" oal 
							INNER JOIN "serviceOrders" so ON oal."orderId" = so.id 
							INNER JOIN "serviceOrderWeights" sow ON sow."serviceOrderId" = so.id 
							INNER JOIN "stores" s ON s."id" = so."storeId"
							WHERE so.id NOT IN (
																	SELECT DISTINCT so.id 
																	FROM "serviceOrders" so 
																	INNER JOIN "orderActivityLog" oal ON so.id = oal."orderId" 
																	INNER JOIN "stores" s ON s.id = so."storeId"
																	WHERE oal."status" IN ('READY_FOR_PICKUP', 'READY_FOR_DRIVER_PICKUP', 'COMPLETED', 'CANCELLED', 'PAYMENT_REQUIRED','HUB_PROCESSING_COMPLETE', 'IN_TRANSIT_TO_STORE', 'DROPPED_OFF_AT_STORE') 
																	AND DATE(timezone(ss."timeZone", oal."updatedAt")) = '{{today}}' 
																	AND s."businessId" = lob.id
																)
							AND DATE(timezone(ss."timeZone", oal."updatedAt")) = '{{today}}' 
							AND s."businessId" = lob.id 
							GROUP BY so.id, sow."chargeableWeight"
						 ) AS unprocessedWeights
			) AS "lbsUnProcessed",
			-- Orders revenue
			(
				SELECT COALESCE(ROUND(SUM(p."totalAmount")::numeric, 2), 0) 
				FROM "payments" p 
				INNER JOIN "stores" s ON p."storeId" = s.id
				WHERE s."businessId" = lob.id 
				AND status = 'succeeded' 
				AND DATE(timezone(ss."timeZone", p."createdAt")) = '{{yesterday}}'
			) AS "ordersRevenue",
			-- New customers
			(
				SELECT COUNT(DISTINCT cc."phoneNumber") 
				FROM "centsCustomers" cc
				INNER JOIN "storeCustomers" sc on sc."centsCustomerId" = cc.id
				INNER JOIN "serviceOrders" so on so."storeCustomerId" = sc.id
				WHERE sc."businessId" = lob.id 
				AND DATE(timezone(ss."timeZone", cc."createdAt")) = '{{yesterday}}'
			) AS "newCustomersCount",
			-- Completed service orders
			(
				SELECT COALESCE(COUNT(so.id), 0) 
				FROM "serviceOrders" so 
				INNER JOIN "stores" s ON so."storeId" = s."id" 
				WHERE s."businessId" = lob.id 
				AND DATE(timezone(ss."timeZone", so."completedAt")) = '{{yesterday}}'
			) AS "completedServiceOrdersCount",
			-- Delivered orders
			(
				SELECT COALESCE(COUNT(o.id), 0)
				FROM "orders" o 
				INNER JOIN "stores" s ON o."storeId" = s."id"
				INNER JOIN "orderDeliveries" od ON od."orderId" = o."id"
				INNER JOIN "serviceOrders" so ON so."id" = o."orderableId"
				WHERE s."businessId" = lob.id
				AND so."orderType" = 'ONLINE'
				AND od.type = 'RETURN'
				AND DATE(timezone(ss."timeZone", od."deliveredAt")) = '{{yesterday}}'			
			) AS "deliveredOrdersCount",
			-- Orders picked up
			(
				SELECT COALESCE(COUNT(o.id), 0)
				FROM "orders" o 
				INNER JOIN "stores" s ON o."storeId" = s."id"
				INNER JOIN "orderDeliveries" od ON od."orderId" = o."id"
				INNER JOIN "serviceOrders" so ON so."id" = o."orderableId"
				WHERE s."businessId" = lob.id
				AND so."orderType" = 'ONLINE'
				AND od.type = 'PICKUP'
				AND od.status = 'COMPLETED'
				AND DATE(timezone(ss."timeZone", od."updatedAt")) = '{{yesterday}}'
			) AS "pickedUpOrdersCount",
			-- Pickups scheduled for today
 			(
				SELECT COALESCE(COUNT(o.id), 0)
				FROM "orders" o 
				INNER JOIN "stores" s ON o."storeId" = s."id"
				INNER JOIN "orderDeliveries" od ON od."orderId" = o."id"
				WHERE s."businessId" = lob.id
				AND od.type = 'PICKUP'
				AND od.status = 'SCHEDULED'
				AND '{{today}}' BETWEEN DATE(to_timestamp(od."deliveryWindow"[1] / 1000) AT TIME ZONE ss."timeZone") AND DATE(to_timestamp(od."deliveryWindow"[2] / 1000) AT TIME ZONE ss."timeZone")
			) AS "pickupsCountScheduledForToday",
			-- Deliveries scheduled for today
			(
				SELECT COALESCE(COUNT(o.id), 0)
				FROM "orders" o 
				INNER JOIN "stores" s ON o."storeId" = s."id"
				INNER JOIN "orderDeliveries" od ON od."orderId" = o."id"
				INNER JOIN "serviceOrders" so ON so."id" = o."orderableId"
				WHERE s."businessId" = lob.id
				AND od.type = 'RETURN'
				AND od.status = 'SCHEDULED'
				AND so."orderType" = 'ONLINE'
				AND '{{today}}' BETWEEN DATE(to_timestamp(od."deliveryWindow"[1] / 1000) AT TIME ZONE ss."timeZone") AND DATE(to_timestamp(od."deliveryWindow"[2] / 1000) AT TIME ZONE ss."timeZone")
			) AS "deliveriesCountScheduledForToday",
			COALESCE(so."totalCount", 0) AS "serviceOrdersCount",
			COALESCE(so."totalValue", 0) AS "serviceOrdersTotalValue",
			COALESCE(io."totalCount", 0) AS "inventoryOrdersCount",
			COALESCE(io."totalValue", 0) AS "inventoryOrdersTotalValue"
			FROM "users" u 
			INNER JOIN "laundromatBusiness" lob ON lob."userId" = u.id
			INNER JOIN (
									SELECT COALESCE(MIN(ss."timeZone"), 'America/New_York') as "timeZone", s."businessId"
									FROM "storeSettings" ss
									INNER JOIN "stores" s ON ss."storeId" = s."id"
                                    GROUP BY s."businessId"
								 ) AS ss ON ss."businessId" = lob.id
			-- New service orders and total order value
			LEFT JOIN (
									SELECT s."businessId", so."placedAt", COUNT(so.id) AS "totalCount", ROUND(SUM(so."orderTotal")::numeric, 2) AS "totalValue"
									FROM "serviceOrders" so
									INNER JOIN "stores" s ON so."storeId" = s."id"
									WHERE so."status" NOT IN ('CANCELLED')
									GROUP BY s."businessId", so."placedAt"
								) AS so ON so."businessId" = lob.id AND DATE(timezone(ss."timeZone", so."placedAt")) = '{{yesterday}}'
			-- New inventory orders and total order value
			LEFT JOIN (
									SELECT s."businessId", io."createdAt", COUNT(io.id) AS "totalCount", ROUND(SUM(io."orderTotal")::numeric, 2) AS "totalValue"
									FROM "inventoryOrders" io
									INNER JOIN "stores" s ON io."storeId" = s."id"
									WHERE io."status" NOT IN ('CANCELLED')
									GROUP BY s."businessId", io."createdAt"
								) AS io ON io."businessId" = lob.id AND DATE(timezone(ss."timeZone", io."createdAt")) = '{{yesterday}}'
			WHERE u."isActive" = true
		 ) dailyReports 
WHERE dailyReports."ordersCountDueToday" > 0
OR dailyReports."poundsDueToday" > 0
OR dailyReports."lbsProcessed" > 0
OR dailyReports."lbsUnProcessed" > 0
OR dailyReports."ordersRevenue" > 0
OR dailyReports."newCustomersCount" > 0
OR dailyReports."completedServiceOrdersCount" > 0
OR dailyReports."deliveredOrdersCount" > 0
OR dailyReports."pickedUpOrdersCount" > 0
OR dailyReports."pickupsCountScheduledForToday" > 0
OR dailyReports."deliveriesCountScheduledForToday" > 0
OR dailyReports."serviceOrdersCount" > 0
OR dailyReports."inventoryOrdersCount" > 0;

WITH
"recurringOrders" AS (
  SELECT 
    CAST(
      COALESCE(
        SUM(
          CASE WHEN COALESCE(so."netOrderTotal", 0) = 'NaN' THEN 0 ELSE COALESCE(so."netOrderTotal", 0) END
        ):: NUMERIC
      ) AS MONEY
    ) AS "totalOrdersValue", 
    CAST(
      COALESCE(
        ROUND(
          AVG(
            CASE WHEN COALESCE(so."netOrderTotal", 0) = 'NaN' THEN 0 ELSE COALESCE(so."netOrderTotal", 0) END
          ):: NUMERIC, 
          2
        ), 
        0
      ) AS MONEY
    ) AS "avgOrderValue", 
    sors."recurringSubscriptionId" 
  FROM 
    "serviceOrderRecurringSubscriptions" sors
	  INNER JOIN "recurringSubscriptions" ON "recurringSubscriptions".id=sors."recurringSubscriptionId" AND "recurringSubscriptions"."deletedAt" is null
    INNER JOIN "serviceOrders" so ON sors."serviceOrderId" = so.id 
  WHERE 
    so."storeId" IN ({{stores}})  AND so."status" NOT IN ('CANCELLED', 'CANCELED')
  GROUP BY 
    sors."recurringSubscriptionId"
) 
SELECT 
  CONCAT(
    cc."firstName", ' ', cc."lastName"
  ) AS "customerName", 
  rs.id, 
  rs."recurringRule", 
  TRIM(
    to_char(
      to_timestamp(rs."pickupWindow" [1] / 1000) AT TIME ZONE ss."timeZone", 
      'Day'
    )
  ) as "pickupDay",
  EXTRACT(
    DOW
    FROM
        DATE(
            to_timestamp(rs."pickupWindow" [1] / 1000) AT TIME ZONE ss."timeZone"
        )
  ) :: text AS "dayOfWeek",
  CASE WHEN ARRAY_LENGTH(rs."returnWindow", 1) > 0 THEN TRIM(
    to_char(
      to_timestamp(rs."returnWindow" [1] / 1000) AT TIME ZONE ss."timeZone", 
      'Day'
    )
  ) ELSE 'Text when ready' END as "deliveryDay", 
  CONCAT(
    to_char(
      to_timestamp(rs."pickupWindow" [1] / 1000) AT TIME ZONE ss."timeZone", 
      'HH:MI AM'
    ), 
    ' - ', 
    to_char(
      to_timestamp(rs."pickupWindow" [2] / 1000) AT TIME ZONE ss."timeZone", 
      'HH:MI AM'
    )
  ) AS "pickupWindow", 
  CASE WHEN ARRAY_LENGTH(rs."returnWindow", 1) > 0 THEN CONCAT(
    to_char(
      to_timestamp(rs."returnWindow" [1] / 1000) AT TIME ZONE ss."timeZone", 
      'HH:MI AM'
    ), 
    ' - ', 
    to_char(
      to_timestamp(rs."returnWindow" [2] / 1000) AT TIME ZONE ss."timeZone", 
      'HH:MI AM'
    )
  ) ELSE 'Text when ready' END as "deliveryWindow", 
  to_char(
    to_timestamp(rs."pickupWindow" [1] / 1000) AT TIME ZONE ss."timeZone", 
    'MM/DD/YYYY'
  ) as "startedDate", 
  rs."cancelledPickupWindows", 
  ss."timeZone" AS "storeTimeZone", 
  s."name" AS "locationName", 
  sm."name" AS "serviceType", 
  cca."postalCode" AS "pickupPostalCode", 
  ro."totalOrdersValue", 
  ro."avgOrderValue",
  COALESCE(z."name", 'Default') as "deliveryZone"
FROM 
  "recurringSubscriptions" rs 
  INNER JOIN "stores" s ON s."id" = rs."storeId" 
  INNER JOIN "storeSettings" ss ON ss."storeId" = s.id 
  INNER JOIN "centsCustomers" cc ON cc."id" = rs."centsCustomerId" 
  INNER JOIN "servicePrices" sp on sp."id" = rs."servicePriceId" 
  INNER JOIN "servicesMaster" sm on sm."id" = sp."serviceId" 
  INNER JOIN "centsCustomerAddresses" cca on cca."id" = rs."centsCustomerAddressId" 
  LEFT JOIN "recurringOrders" ro ON ro."recurringSubscriptionId" = rs.id 
  LEFT JOIN "ownDeliverySettings" ods ON ods."storeId" = s.id 
  LEFT JOIN "zones" z ON z."ownDeliverySettingsId" = ods.id and 
  cca."postalCode"=ANY(z."zipCodes")
WHERE 
  rs."deletedAt" IS NULL 
  AND rs."storeId" IN ({{stores}})
ORDER BY "dayOfWeek"

SELECT
  "timings"."id",
  COUNT(DISTINCT("activeOrderDeliveries"."orderId")) as "activeOrderDeliveriesCount",
  COUNT(DISTINCT("activeRecurringSubscriptions".id)) as "activeRecurringSubscriptionCount"
FROM "timings"
INNER JOIN "shifts" ON "shifts"."id" = "timings"."shiftId"
INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "shifts"."storeId"
LEFT JOIN LATERAL (
  SELECT "orderDeliveries"."orderId"
  FROM "orderDeliveries"
  WHERE "orderDeliveries"."timingsId" = "timings"."id"
	AND "orderDeliveries"."status" NOT IN ('COMPLETED','FAILED','CANCELED')
  -- Checking if either changed startTime OR endTime boundaries have orders prior to or after the time respectively
	AND (
    (
      to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
    )::time < (
      '{{{newStartTime}}}' at time zone 'UTC'
    )::time
    OR (
      to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
    )::time > (
      '{{{newEndTime}}}' at time zone 'UTC'
    )::time
  )
) AS "activeOrderDeliveries" ON TRUE
LEFT JOIN LATERAL(
  SELECT "recurringSubscriptions".id
  FROM "recurringSubscriptions"
  WHERE "recurringSubscriptions"."deletedAt" isNull
    AND (
      (
        "recurringSubscriptions"."pickupTimingsId" = "timings".id
        AND (
          (
            to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
          )::time < (
            '{{{newStartTime}}}' at time zone 'UTC'
          )::time
          OR (
            to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
          )::time > (
            '{{{newEndTime}}}' at time zone 'UTC'
          )::time
        )
      )
      OR
      (
        "recurringSubscriptions"."returnTimingsId" = "timings".id
        AND (
          (
            to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
          )::time < (
            '{{{newStartTime}}}' at time zone 'UTC'
          )::time
          OR (
            to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
          )::time > (
            '{{{newEndTime}}}' at time zone 'UTC'
          )::time
        )
	    )
    )
) AS "activeRecurringSubscriptions" ON TRUE
WHERE "shifts"."storeId" = {{storeId}}
  AND "shifts"."type" = 'CENTS_DELIVERY'
  AND "timings"."id" IN ({{timingIds}})
GROUP BY "timings"."id"

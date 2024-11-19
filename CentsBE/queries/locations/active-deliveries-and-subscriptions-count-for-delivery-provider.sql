SELECT
  {{#timingIds}}
  "timings"."id",
  {{/timingIds}}
  COUNT(DISTINCT("activeOrderDeliveries"."orderId")) as "activeOrderDeliveriesCount",
  COUNT(DISTINCT("activeRecurringSubscriptions".id)) as "activeRecurringSubscriptionCount"
FROM "timings"
INNER JOIN "shifts" ON "shifts"."id" = "timings"."shiftId"
LEFT JOIN LATERAL (
  SELECT "orderDeliveries"."orderId"
  FROM "orderDeliveries"
  WHERE "orderDeliveries"."timingsId" = "timings".id 
    AND "orderDeliveries"."status" NOT IN ('COMPLETED','FAILED','CANCELED')
) AS "activeOrderDeliveries" ON TRUE
LEFT JOIN LATERAL(
  SELECT "recurringSubscriptions".id
  FROM "recurringSubscriptions"
  WHERE "recurringSubscriptions"."deletedAt" isNull 
    AND (
      "recurringSubscriptions"."pickupTimingsId" = "timings".id OR
      "recurringSubscriptions"."returnTimingsId" = "timings".id
    )
) AS "activeRecurringSubscriptions" ON TRUE
WHERE "shifts"."storeId" = {{storeId}} 
{{#shiftTypes}}
AND "shifts"."type" IN ({{{shiftTypes}}})
{{/shiftTypes}}
{{#timingIds}}
AND "timings"."id" IN ({{timingIds}})
GROUP BY "timings"."id"
{{/timingIds}}

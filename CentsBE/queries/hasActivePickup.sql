SELECT
  od."deliveryWindow",
  sors."pickupWindow" AS "originalPickupWindow",
  od."status" AS "pickupStatus",
  so."status" AS "orderStatus"
FROM "recurringSubscriptions" rs
INNER JOIN "serviceOrderRecurringSubscriptions" sors
        ON sors."recurringSubscriptionId" = rs.id
INNER JOIN "serviceOrders" so
        ON so.id = sors."serviceOrderId"
        AND so."orderType" = 'ONLINE'
        {{#statusFilter}}
        AND so."status" NOT IN ('COMPLETED','CANCELED','CANCELLED')
        {{/statusFilter}}
JOIN "orders" o
  ON o."orderableId" = so.id
  AND o."orderableType" in ('ServiceOrder','serviceOrder')
JOIN "orderDeliveries" od
  ON od."orderId" = o.id
  AND od."type" = 'PICKUP'
  {{#statusFilter}}
  AND od."status" NOT IN ('COMPLETED','CANCELED','CANCELLED')
  {{/statusFilter}}
WHERE rs.id = {{recurringSubscriptionId}}
ORDER BY od."id" DESC
LIMIT 1

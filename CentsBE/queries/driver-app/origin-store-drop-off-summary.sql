WITH "filteredRouteDeliveries" AS (
  SELECT *
  FROM "routeDeliveries"
  WHERE "routeDeliveries"."routeId" = {{routeId}}
),
"filteredOrderDeliveries" AS (
  SELECT
    "orders"."orderableId" AS "serviceOrderId",
    "orderDeliveries"."type",
    "filteredRouteDeliveries"."status"
  FROM "filteredRouteDeliveries"
  INNER JOIN "orderDeliveries"
          ON "filteredRouteDeliveries"."routableId" = "orderDeliveries".id
         AND "filteredRouteDeliveries"."routableType" = 'OrderDelivery'
  INNER JOIN "orders" ON "orders"."id" = "orderDeliveries"."orderId"
),
"pickupOrderIdsAndBags" AS (
  SELECT sub."serviceOrderId", COUNT("serviceOrderBags".id) AS "bagsCount"
  FROM (
    -- Get Driver PickedUp Online Orders
    SELECT "serviceOrderId"
    FROM "filteredOrderDeliveries"
    WHERE "type"= 'PICKUP'
      AND "status" = 'PICKED_UP'

    UNION

    -- Get Driver Canceled Online Orders
    SELECT "serviceOrderId"
    FROM "filteredOrderDeliveries"
    WHERE "type"= 'RETURN'
      AND "status" = 'CANCELED'

    UNION

    -- Get Driver PickedUp Hub/Spoke Orders
    SELECT "serviceOrderRouteDeliveries"."serviceOrderId"
    FROM "serviceOrderRouteDeliveries"
    INNER JOIN "filteredRouteDeliveries"
            ON "filteredRouteDeliveries".id = "serviceOrderRouteDeliveries"."routeDeliveryId"
    WHERE "serviceOrderRouteDeliveries"."status" = 'PICKED_UP'
    AND "serviceOrderRouteDeliveries"."type" = '{{pickupType}}'
  ) AS sub
  INNER JOIN "serviceOrders" ON "serviceOrders"."id" = "sub"."serviceOrderId"
  INNER JOIN "serviceOrderBags" ON "serviceOrderBags"."serviceOrderId" = "serviceOrders".id
  GROUP BY "sub"."serviceOrderId"
)

SELECT COUNT("serviceOrderId")::INT AS "ordersCount", SUM("bagsCount")::INT AS "bagsCount"
FROM "pickupOrderIdsAndBags"

SELECT * FROM (
  {{#pickup}}
  WITH "filtered_service_orders" AS (
    SELECT *
    FROM "serviceOrders"
    WHERE "serviceOrders"."status" = '{{serviceOrderStatus}}'
      {{#ishub}}
      AND "serviceOrders"."hubId"= {{storeId}}
      AND "serviceOrders"."storeId"={{destinationStoreId}}
      {{/ishub}}
      {{^ishub}}
      AND "serviceOrders"."storeId"= {{storeId}}
      AND "serviceOrders"."hubId"={{destinationStoreId}}
      {{/ishub}}
  ),
  "service_order_bags" AS(
    SELECT "serviceOrderBags"."serviceOrderId", COUNT("serviceOrderBags".id)::INT AS "bagsCount"
      FROM "serviceOrderBags"
      INNER JOIN "filtered_service_orders" ON "filtered_service_orders".id = "serviceOrderBags"."serviceOrderId"
      group by "serviceOrderBags"."serviceOrderId"
  )
  SELECT "filtered_service_orders".id, "filtered_service_orders"."orderCode", "filtered_service_orders"."orderType",
  "service_order_bags"."bagsCount", false AS "bagsScanned" FROM "filtered_service_orders"
  INNER JOIN "service_order_bags" ON "service_order_bags"."serviceOrderId" = "filtered_service_orders".id

  UNION
{{/pickup}}
(
  WITH "routed_service_orders" AS (
    SELECT "serviceOrderRouteDeliveries"."serviceOrderId","serviceOrderRouteDeliveries"."status"  FROM "serviceOrderRouteDeliveries"
    INNER JOIN "routeDeliveries" ON "routeDeliveries".id = "serviceOrderRouteDeliveries"."routeDeliveryId"
    WHERE "routeDeliveries".id = {{routeDeliveryId}}
    AND "serviceOrderRouteDeliveries"."type" = '{{type}}'
  ),
  "service_order_bags" AS(
    SELECT "serviceOrderBags"."serviceOrderId", COUNT("serviceOrderBags".id)::INT AS "bagsCount"
    FROM "serviceOrderBags"
    INNER JOIN "routed_service_orders" ON "routed_service_orders"."serviceOrderId" = "serviceOrderBags"."serviceOrderId"
    group by "serviceOrderBags"."serviceOrderId"
  )
  SELECT
    "serviceOrders"."id",
    "serviceOrders"."orderCode",
    "serviceOrders"."orderType",
    "service_order_bags"."bagsCount",
    {{#pickup}}
    CASE when "routed_service_orders".status IN ('PICKED_UP', 'DROPPED_OFF') THEN TRUE ELSE FALSE END
    {{/pickup}}
    {{^pickup}}
    CASE when "routed_service_orders".status = 'DROPPED_OFF' THEN TRUE ELSE FALSE END
    {{/pickup}} as "bagsScanned"
  FROM "serviceOrders"
  INNER JOIN "routed_service_orders" ON "routed_service_orders"."serviceOrderId" = "serviceOrders".id
  INNER JOIN "service_order_bags" ON "service_order_bags"."serviceOrderId" = "serviceOrders".id))
  as orders

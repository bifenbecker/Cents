select * from (with filtered_service_orders AS(
select "serviceOrders".* from "serviceOrders"
inner join stores ON stores.id = "serviceOrders"."storeId"
inner join "storeSettings" ON "storeSettings"."storeId" = stores.id
where
  stores."businessId" = {{businessId}}
  {{#allStoresCheck}}
    AND stores.id IN ({{allStoreIds}})
  {{/allStoresCheck}}
  {{^allStoresCheck}}
    AND stores.id IN ({{storeIds}})
  {{/allStoresCheck}}
  {{#statusCompleted}}
    AND "serviceOrders".status IN ('COMPLETED')
  {{/statusCompleted}}
  {{#statusCompletedAndActive}}
    AND "serviceOrders".status NOT IN ('CANCELLED')
  {{/statusCompletedAndActive}}
  {{#statusCompletedAndCancelled}}
    AND "serviceOrders".status IN ('COMPLETED', 'CANCELLED')
  {{/statusCompletedAndCancelled}}
  {{#statusActive}}
    AND "serviceOrders".status NOT IN ('COMPLETED', 'CANCELLED')
  {{/statusActive}}
  {{#statusActiveAndCancelled}}
    AND "serviceOrders".status NOT IN ('COMPLETED')
  {{/statusActiveAndCancelled}}
  {{#statusCancelled}}
    AND "serviceOrders".status IN ('CANCELLED')
  {{/statusCancelled}}
  AND CAST("serviceOrders"."placedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) between '{{startDate}}' and '{{endDate}}'
),
"intakeCompletedActivity" AS (
	SELECT
	"filtered_service_orders"."id" as "service_order_id",
  "orderActivityLog"."updatedAt" AS "intakeCompletedDate",
	(
		CASE
	    WHEN "orderActivityLog"."id" is not NULL THEN true
			ELSE false
       END
    ) AS "isIntakeCompleted"
	FROM "filtered_service_orders"
    INNER JOIN "orderActivityLog" ON "orderActivityLog"."orderId" = "filtered_service_orders"."id"
		AND "orderActivityLog"."status" IN ('READY_FOR_PROCESSING', 'DESIGNATED_FOR_PROCESSING_AT_HUB', 'HUB_PROCESSING_ORDER', 'DROPPED_OFF_AT_HUB')
),
in_take AS(
    select "serviceOrderWeights"."serviceOrderId" as service_order_id,
    sum( case when "serviceOrderWeights".step = 1 then "serviceOrderWeights"."chargeableWeight" end) as "inTakePounds"
    from "serviceOrderWeights"
    inner join filtered_service_orders ON "serviceOrderWeights"."serviceOrderId" = filtered_service_orders.id 
    group by  "serviceOrderWeights"."serviceOrderId"
 ),
 products_values AS (
    select distinct("serviceOrderItems"."orderId") as service_order_id,
    sum(case when "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "productValue" from "serviceReferenceItems"
    inner join "serviceOrderItems" ON "serviceOrderItems".id = "serviceReferenceItems"."orderItemId" AND "serviceOrderItems"."deletedAt" IS NULL
    inner join "serviceReferenceItemDetails" ON "serviceReferenceItemDetails"."serviceReferenceItemId" = "serviceReferenceItems".id AND "serviceReferenceItemDetails"."deletedAt" IS NULL
  inner join filtered_service_orders ON filtered_service_orders.id = "serviceOrderItems"."orderId"
  where "serviceReferenceItems"."deletedAt" IS NULL
  group by "serviceOrderItems"."orderId"
),
laundry_bags_product_value AS (
    select distinct("serviceOrderItems"."orderId") as service_order_id,
    sum(case when "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "productValue" from "serviceReferenceItems"
    inner join "serviceOrderItems" ON "serviceOrderItems".id = "serviceReferenceItems"."orderItemId" AND "serviceOrderItems"."deletedAt" IS NULL
    inner join "serviceReferenceItemDetails" ON "serviceReferenceItemDetails"."serviceReferenceItemId" = "serviceReferenceItems".id AND "serviceReferenceItemDetails"."deletedAt" IS NULL
    inner join "inventoryItems" ON "inventoryItems".id = "serviceReferenceItemDetails"."soldItemId" AND "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem'
    inner join "inventory" ON "inventory".id = "inventoryItems"."inventoryId"
    inner join "inventoryCategories" ON "inventoryCategories".id = "inventory"."categoryId"
  inner join filtered_service_orders ON filtered_service_orders.id = "serviceOrderItems"."orderId"
  where "serviceReferenceItems"."deletedAt" IS NULL
  AND "inventoryCategories".id = 1
  group by "serviceOrderItems"."orderId"
),
in_take_pounds As (
  select "serviceOrderItems"."orderId" as service_order_id,
  sum (case when "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "productValue",
  sum(case when "serviceReferenceItemDetails"."pricingType" = 'PER_POUND' or "serviceReferenceItemDetails"."soldItemType" = 'Modifier' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "perPoundValue",
  sum(case when "serviceReferenceItemDetails"."soldItemType" = 'Modifier' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "totalModifierValue",
  sum(case when "serviceReferenceItemDetails"."pricingType" = 'FIXED_PRICE' AND "serviceReferenceItemDetails"."soldItemType" != 'InventoryItem' then "serviceReferenceItemDetails"."lineItemTotalCost" else 0 end)::numeric::money as "fixedPriceValue",
  ARRAY_TO_STRING(ARRAY_AGG(DISTINCT "serviceReferenceItemDetails"."lineItemName") FILTER (WHERE "serviceReferenceItemDetails"."soldItemType" = 'InventoryItem'), ', ') as products,
  ARRAY_TO_STRING(ARRAY_AGG(DISTINCT "serviceReferenceItemDetails"."lineItemName") FILTER (WHERE "serviceReferenceItemDetails"."soldItemType" = 'Modifier'), ', ') as modifiers
  from "serviceReferenceItems"
  join "serviceOrderItems" ON "serviceOrderItems".id = "serviceReferenceItems"."orderItemId" AND "serviceOrderItems"."deletedAt" IS NULL
  join "serviceReferenceItemDetails" ON "serviceReferenceItemDetails"."serviceReferenceItemId" = "serviceReferenceItems".id AND "serviceReferenceItemDetails"."deletedAt" IS NULL
  where "serviceReferenceItems"."deletedAt" IS NULL
  group by "serviceOrderItems"."orderId"
),
filtered_service_ref_items AS (
    select filtered_service_orders.id as service_order_id,
    "serviceReferenceItems".* from "serviceReferenceItems"
    inner join "serviceOrderItems" ON "serviceOrderItems".id = "serviceReferenceItems"."orderItemId" AND "serviceOrderItems"."deletedAt" IS NULL
    inner join filtered_service_orders ON filtered_service_orders.id = "serviceOrderItems"."orderId"
    WHERE "serviceReferenceItems"."deletedAt" IS NULL
  ),
service_orders_with_master_order AS (
  SELECT "filtered_service_orders".id AS service_order_id, orders.id AS master_order_id FROM filtered_service_orders
  INNER JOIN orders ON orders."orderableId" =  "filtered_service_orders".id AND orders."orderableType" = 'ServiceOrder'
),
order_payments AS (
 	SELECT service_orders_with_master_order.service_order_id, SUM(payments."transactionFee")::numeric::money AS "transactionFee", MAX(payments."esdReceiptNumber") AS "esdReceiptNumber", max(payments."createdAt") AS "createdAt", ARRAY_TO_STRING(ARRAY_AGG("payments"."esdReceiptNumber") FILTER (WHERE "payments"."esdReceiptNumber" IS NOT NULL), ', ') AS "cashCardReceipt", ARRAY_TO_STRING(ARRAY_AGG(payments."paymentMemo"),  ', ') AS "paymentMemo",
  ARRAY_TO_STRING(
    ARRAY_AGG(DISTINCT CASE 
        WHEN payments."paymentProcessor" = 'stripe' THEN 'Debit/Credit'
        WHEN payments."paymentProcessor" IN ('cashCard', 'CCI', 'ESD', 'SpyderWash')  THEN 'Cash Card'
        WHEN payments."paymentProcessor" = 'cash' THEN 'Cash'
        WHEN payments."paymentProcessor" = 'other' THEN 'Other'
        ELSE payments."paymentProcessor"
        END
      ), ', ') AS "paymentType"
 FROM payments
  INNER JOIN service_orders_with_master_order ON service_orders_with_master_order.master_order_id = payments."orderId"
  WHERE payments.status = 'succeeded'
 	GROUP BY service_orders_with_master_order.service_order_id
 ),
 pickup_and_deliveries AS (
  select service_orders_with_master_order.service_order_id, "orderDeliveries".* from "orderDeliveries"
  INNER JOIN service_orders_with_master_order ON service_orders_with_master_order.master_order_id = "orderDeliveries"."orderId"
  WHERE status NOT IN ('CANCELED', 'CANCELLED')
 ),
services AS (
  select service_order_id, ARRAY_TO_STRING(ARRAY_AGG(DISTINCT name) FILTER (WHERE name IS NOT NULL AND pricingType = 'FIXED_PRICE'), ', ') as "fixedPriceServices",
   ARRAY_TO_STRING(ARRAY_AGG(DISTINCT name) FILTER (WHERE name IS NOT NULL AND (pricingType = 'PER_POUND'  or sold_item_type = 'Modifier')), ', ') as "perPoundServices"
   FROM (
     select filtered_service_ref_items.service_order_id as service_order_id,
     service_reference_item_details."soldItemType" as sold_item_type,
     service_reference_item_details.category as category, service_reference_item_details."lineItemName" as name,
     service_reference_item_details."pricingType" as pricingType
     from filtered_service_ref_items 
     join "serviceReferenceItemDetails" as service_reference_item_details on filtered_service_ref_items.id =  service_reference_item_details."serviceReferenceItemId" AND service_reference_item_details."deletedAt" IS NULL
     and (
        filtered_service_ref_items."inventoryItemId" is null
      )
   ) temp
   group by temp.service_order_id
)
select
	"serviceOrders"."orderCode" as "id",
	CASE WHEN  "serviceOrders"."storeId" is not null THEN stores.address ELSE hub.address END AS "address",
  "serviceOrders"."placedAt",
  to_char((CASE WHEN "serviceOrders"."orderType" = 'ONLINE' AND "intakeCompletedActivity"."intakeCompletedDate" IS NOT NULL THEN "intakeCompletedActivity"."intakeCompletedDate" ELSE "serviceOrders"."placedAt" END) AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY') as "orderIntakeDate",
  to_char((CASE WHEN "serviceOrders"."orderType" = 'ONLINE' AND "intakeCompletedActivity"."intakeCompletedDate" IS NOT NULL THEN "intakeCompletedActivity"."intakeCompletedDate" ELSE "serviceOrders"."placedAt" END) AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM') as "orderIntakeTime",
	(CASE 
 	WHEN "intakeCompletedActivity"."isIntakeCompleted" = TRUE
 		THEN (CASE WHEN in_take_emp."firstname" is not null THEN (CONCAT(in_take_emp."firstname",' ',in_take_emp."lastname")) ELSE 'NA' END)
 	ELSE 'Submitted online, intake not complete' 
 	END)  as "IntakeEmployee",
	CONCAT(customer."firstName",' ',customer."lastName") as "customerName",
  customer."phoneNumber" as "customerPhoneNumber",
  "serviceOrders"."orderType" AS "orderType",
	in_take ."inTakePounds" AS "inTakePounds",
	services."perPoundServices" AS "perPoundServices",
	in_take_pounds."perPoundValue" AS "perPoundValue",
	services."fixedPriceServices" AS "fixedPriceServices",
	in_take_pounds."fixedPriceValue" AS "fixedPriceValue",
	in_take_pounds."products" AS "products",
  in_take_pounds."modifiers" as "modifiers",
  in_take_pounds."totalModifierValue" AS "totalModifierValue",
	products_values."productValue" AS "productsValue",
  laundry_bags_product_value."productValue" as "laundryBagTotalValue",
  COALESCE(delivery."totalDeliveryCost", 0)::numeric::money AS "deliveryFee",
  COALESCE(pickup."totalDeliveryCost", 0)::numeric::money AS "pickupFee",
  COALESCE(delivery."courierTip", 0)::numeric::money AS "onDemandDeliveryTip",
  COALESCE(pickup."courierTip", 0)::numeric::money AS "onDemandPickupTip",
  delivery.status AS "deliveryStatus",
  pickup.status AS "pickupStatus",
  (delivery."subsidyInCents"::decimal / 100)::money AS "deliverySubsidy",
  (pickup."subsidyInCents"::decimal / 100)::money AS "pickupSubsidy",
	coalesce(products_values."productValue"::numeric::money, 0::money) + coalesce(in_take_pounds."perPoundValue"::numeric::money, 0::money) + coalesce(in_take_pounds."fixedPriceValue"::numeric::money, 0::money) as "subTotalOrderValue",
  ("serviceOrders"."taxAmountInCents"::decimal / 100)::money AS "taxAmount",
	"orderPromoDetails"."promoDetails" -> 'name' as "promoCode",
	COALESCE("serviceOrders"."promotionAmount", 0)::numeric::money as "promoDiscount",
	COALESCE("serviceOrders"."creditAmount", 0)::numeric::money AS "creditApplied",
  COALESCE("serviceOrders"."tipAmount", 0)::numeric::money AS "tipAmount",
  COALESCE("serviceOrders"."convenienceFee", 0)::numeric::money AS "convenienceFee",
	COALESCE(ROUND("serviceOrders"."netOrderTotal"::numeric, 2), 0)::money AS "netOrderTotal",
  order_payments."transactionFee",
	to_char(order_payments."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY') as "orderPaymentDate",
  to_char(order_payments."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM') as "orderPaymentTime",
  CASE WHEN order_payments is not null THEN CONCAT(in_take_emp."firstname",' ',in_take_emp."lastname") ELSE null END AS "paymentEmployee",
	order_payments."cashCardReceipt" AS "cashCardReceipt",
	order_payments."paymentMemo" AS "paymentMemo",
	order_payments."paymentType" AS "paymentType",
    LOWER(REPLACE("serviceOrders"."paymentStatus", '_', ' ')) AS "paymentStatus",
    LOWER(REPLACE("serviceOrders".status, '_', ' ')) AS "orderStatus",
    "serviceOrders"."recurringDiscountInCents" AS "recurringDiscountInCents"
from filtered_service_orders
inner join "serviceOrders" ON filtered_service_orders.id = "serviceOrders".id
left join in_take_pounds ON in_take_pounds.service_order_id = "serviceOrders".id
left join in_take ON in_take.service_order_id = "serviceOrders".id
left join services ON services.service_order_id = "serviceOrders".id
left join products_values ON products_values.service_order_id = "serviceOrders".id
left join laundry_bags_product_value ON laundry_bags_product_value.service_order_id = "serviceOrders".id
left join stores ON stores.id = "serviceOrders"."storeId"
left join "storeSettings" ON "storeSettings"."storeId" = "stores".id
left join stores as hub ON hub.id = "serviceOrders"."hubId"
left join "teamMembers" ON "teamMembers"."id" = "serviceOrders"."employeeCode" and "teamMembers"."businessId" = {{businessId}}
left join users as in_take_emp ON in_take_emp.id = "teamMembers"."userId"
left join "storeCustomers" as customer ON "customer".id = "serviceOrders"."storeCustomerId"
inner join orders ON orders."orderableId" = "serviceOrders".id and orders."orderableType" = 'ServiceOrder'
left join "orderPromoDetails" ON "orderPromoDetails"."orderId" = orders."id"
left join order_payments ON order_payments.service_order_id = "serviceOrders".id
left join "intakeCompletedActivity" ON "intakeCompletedActivity"."service_order_id"="serviceOrders".id
left join pickup_and_deliveries AS pickup ON pickup.service_order_id = "serviceOrders".id AND pickup.type = 'PICKUP'
left join pickup_and_deliveries AS delivery ON delivery.service_order_id = "serviceOrders".id AND delivery.type = 'RETURN'

union

(WITH filtered_inventory_orders AS(
select "inventoryOrders".* from "inventoryOrders"
inner join stores ON stores.id = "inventoryOrders"."storeId"
inner join "storeSettings" on "storeSettings"."storeId" = "stores"."id"
where "inventoryOrders"."paymentStatus" = 'PAID'
  AND stores."businessId" = {{businessId}}
    {{#allStoresCheck}}
      AND stores.id IN ({{allStoreIds}})
    {{/allStoresCheck}}
    {{^allStoresCheck}}
      AND stores.id IN ({{storeIds}})
    {{/allStoresCheck}}
    {{#statusCompleted}}
      AND "inventoryOrders".status IN ('COMPLETED')
    {{/statusCompleted}}
    {{#statusCompletedAndActive}}
      AND "inventoryOrders".status NOT IN ('CANCELLED')
    {{/statusCompletedAndActive}}
    {{#statusCompletedAndCancelled}}
      AND "inventoryOrders".status IN ('COMPLETED', 'CANCELLED')
    {{/statusCompletedAndCancelled}}
    {{#statusActive}}
      AND "inventoryOrders".status NOT IN ('COMPLETED', 'CANCELLED')
    {{/statusActive}}
    {{#statusActiveAndCancelled}}
      AND "inventoryOrders".status NOT IN ('COMPLETED')
    {{/statusActiveAndCancelled}}
    {{#statusCancelled}}
      AND "inventoryOrders".status IN ('CANCELLED')
    {{/statusCancelled}}
  AND CAST("inventoryOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) between '{{startDate}}' and '{{endDate}}'
),
inventory_products AS(
	select filtered_inventory_orders.id as inventory_order_id,  ARRAY_TO_STRING(ARRAY_AGG(DISTINCT inventory."productName") FILTER (WHERE inventory."productName" IS NOT NULL), ', ') as products,
	sum("inventoryOrderLineItems"."lineItemTotalCost")::numeric::money as "productValue"
	from filtered_inventory_orders
	inner join "inventoryOrderLineItems" ON "inventoryOrderLineItems"."inventoryOrderId" = filtered_inventory_orders.id
	inner join "inventoryItems" ON "inventoryItems".id = "inventoryOrderLineItems"."inventoryItemId"
	inner join "inventory" ON inventory.id = "inventoryItems"."inventoryId"
	group by filtered_inventory_orders.id
),
inventory_laundry_bags_product_value AS (
	select filtered_inventory_orders.id as inventory_order_id,
	sum("inventoryOrderLineItems"."lineItemTotalCost")::numeric::money as "productValue"
	from filtered_inventory_orders
	inner join "inventoryOrderLineItems" ON "inventoryOrderLineItems"."inventoryOrderId" = filtered_inventory_orders.id
	inner join "inventoryItems" ON "inventoryItems".id = "inventoryOrderLineItems"."inventoryItemId"
	inner join "inventory" ON inventory.id = "inventoryItems"."inventoryId"
  inner join "inventoryCategories" ON inventory."categoryId" = "inventoryCategories".id
  where "inventoryCategories".id = 1
	group by filtered_inventory_orders.id
)
select
	"inventoryOrders"."orderCode",
	stores.address, -- "Order Location"
  "inventoryOrders"."createdAt", -- "placedAt"
  to_char("inventoryOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY'), --"orderIntakeDate"
  to_char("inventoryOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM'), --"orderIntakeTime"
	(CASE 
    WHEN in_take_emp."firstname" is not null 
      THEN (CONCAT(in_take_emp."firstname",' ',in_take_emp."lastname")) 
    ELSE 'NA'
  END), -- "IntakeEmployee",
	CONCAT(customer."firstName",' ',customer."lastName"), -- "Customer Name"
  customer."phoneNumber" as "customerPhoneNumber",
  'INVENTORY' AS "orderType",
	0, -- Intake Pounds
	null, -- Per Pound Service
	null, -- Per Pound Service Value
	null, -- Fixed Price Services
	null, -- Fixed Price Services Value
	inventory_products.products,
  NULL AS "modifiers",
  0::money AS "totalModifierValue",
  inventory_products."productValue",
  inventory_laundry_bags_product_value."productValue" as "laundryBagTotalValue",
  0::money AS "deliveryFee",
  0::money AS "pickupFee",
  0::money AS "onDemandDeliveryTip",
  0::money AS "onDemandPickupTip",
  NULL AS "deliveryStatus",
  NULL AS "pickupStatus",
  0::money AS "deliverySubsidy",
  0::money AS "pickupSubsidy",
  coalesce(inventory_products."productValue"::numeric::money, 0::money) as "subTotalOrderValue",
	("inventoryOrders"."salesTaxAmount"::decimal / 100)::money AS "taxAmount",
	"orderPromoDetails"."promoDetails" -> 'name' as "promoCode",
	COALESCE("inventoryOrders"."promotionAmount", 0)::numeric::money as "promoDiscount",
	COALESCE("inventoryOrders"."creditAmount", 0)::numeric::money,
  COALESCE("inventoryOrders"."tipAmount", 0)::numeric::money,
  COALESCE("inventoryOrders"."convenienceFee", 0)::numeric::money AS "convenienceFee",
	COALESCE(Round("inventoryOrders"."netOrderTotal"::numeric, 2), 0)::money AS netOrderTotal,
  payments."transactionFee"::numeric::money,
	to_char(payments."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY') as "orderPaymentDate",
  to_char(payments."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM') as "orderPaymentTime",
  CASE WHEN payments is not null THEN CONCAT(in_take_emp."firstname",' ',in_take_emp."lastname") ELSE null END AS "paymentEmployee",
	payments."esdReceiptNumber" AS "cashCardReceipt",
	payments."paymentMemo" AS "paymentMemo",
	CASE WHEN payments."paymentProcessor" = 'stripe' THEN 'Debit/Credit'
        WHEN payments."paymentProcessor" IN ('cashCard', 'CCI', 'ESD', 'SpyderWash')  THEN 'Cash Card'
        WHEN payments."paymentProcessor" = 'cash' THEN 'Cash'
        WHEN payments."paymentProcessor" = 'other' THEN 'Other'
        ELSE payments."paymentProcessor"
        END as "paymentType",
    LOWER(REPLACE("inventoryOrders"."paymentStatus", '_', ' ')) AS "paymentStatus",
    LOWER(REPLACE("inventoryOrders".status, '_', ' ')) AS "orderStatus",
    NULL AS "recurringDiscountInCents"
from filtered_inventory_orders
inner join "inventoryOrders" ON "inventoryOrders".id = filtered_inventory_orders.id
inner join orders on orders."orderableId" = "inventoryOrders".id  AND orders."orderableType" = 'InventoryOrder'
inner join stores ON stores.id = "inventoryOrders"."storeId"
inner join inventory_products ON inventory_products.inventory_order_id = "inventoryOrders".id
inner join "storeSettings" on "storeSettings"."storeId" = "stores"."id"
left join inventory_laundry_bags_product_value ON inventory_laundry_bags_product_value.inventory_order_id = "inventoryOrders".id
left join "teamMembers" ON "teamMembers"."id" = "inventoryOrders"."employeeId" and "teamMembers"."businessId" = {{businessId}}
left join users as in_take_emp ON in_take_emp.id = "teamMembers"."userId"
left join "storeCustomers" as customer ON customer.id = "inventoryOrders"."storeCustomerId"
left join "orderPromoDetails" ON "orderPromoDetails"."orderId" = orders."id"
inner join payments ON payments."orderId" = orders.id
            AND "payments".id = (
                                SELECT p.id
                                FROM "payments" p 
                                WHERE p."orderId" = orders.id
                                order by p."updatedAt" desc limit 1)
)) as "orderReport" order by "placedAt" desc

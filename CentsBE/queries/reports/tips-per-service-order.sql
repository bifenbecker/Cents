WITH "filteredServiceOrders" AS (
  SELECT "serviceOrders".*, "storeSettings"."timeZone"
  FROM "serviceOrders"
  INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "serviceOrders"."storeId"
  WHERE "serviceOrders"."tipAmount" > 0
    AND "serviceOrders"."status" = 'COMPLETED'
    AND "serviceOrders"."storeId" IN ({{storeIds}})
    AND CAST("serviceOrders"."completedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '{{startDate}}' AND '{{endDate}}'
),
"filteredOrderLogs" AS (
  SELECT DISTINCT ON ("orderActivityLog"."orderId", "orderActivityLog"."status") "orderActivityLog".*
  FROM "orderActivityLog"
  INNER JOIN "filteredServiceOrders" ON "filteredServiceOrders"."id" = "orderActivityLog"."orderId"
),
"firstSucceededPayment" AS (
  SELECT DISTINCT ON ("payments"."orderId", "payments"."status") "payments"."createdAt", "filteredServiceOrders"."id" AS "serviceOrderId"
  FROM "payments"
  INNER JOIN "orders" on "orders".id = "payments"."orderId"
  INNER JOIN "filteredServiceOrders" ON "filteredServiceOrders"."id" = "orders"."orderableId" AND "orders"."orderableType" = 'ServiceOrder'
  WHERE "payments"."status" = 'succeeded'
),
"cumulativeIntakeWeight" AS (
  SELECT
    "serviceOrderWeights"."serviceOrderId",
    SUM(
      CASE
        WHEN "serviceOrderWeights".step = 1 THEN "serviceOrderWeights"."totalWeight"
      END
    ) AS "inTakePounds"
  FROM "serviceOrderWeights"
  INNER JOIN "filteredServiceOrders" ON "filteredServiceOrders"."id" = "serviceOrderWeights"."serviceOrderId"
  GROUP BY "serviceOrderWeights"."serviceOrderId"
)

SELECT
  "filteredServiceOrders".id,
  "filteredServiceOrders"."orderCode",
  "stores"."name",
  "filteredServiceOrders"."netOrderTotal",
  "filteredServiceOrders"."tipAmount",
  TRIM(
    CONCAT(
      "storeCustomers"."firstName",
      ' ',
      "storeCustomers"."lastName"
    )
  ) AS "customerName",
  to_char(
    "firstSucceededPayment"."createdAt" AT TIME ZONE "storeSettings"."timeZone",
    'MM-DD-YYYY'
  ) AS "paymentDate",
  "intakeLog"."employeeName" AS "intakeEmployee",
  "washingLog"."employeeName" AS "washingEmployee",
  "dryingLog"."employeeName" AS "dryingEmployee", 
  "completeProcessingLog"."employeeName" AS "completeProcessingEmployee",
  "completeLog"."employeeName" AS "completeEmployee",
  "cumulativeIntakeWeight"."inTakePounds"
FROM "filteredServiceOrders"
INNER JOIN "stores" ON "stores"."id" = "filteredServiceOrders"."storeId"
INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "stores"."id"
INNER JOIN "storeCustomers" ON "storeCustomers"."id" = "filteredServiceOrders"."storeCustomerId"
LEFT JOIN "firstSucceededPayment" ON "firstSucceededPayment"."serviceOrderId" = "filteredServiceOrders"."id"
LEFT JOIN "cumulativeIntakeWeight" ON "cumulativeIntakeWeight"."serviceOrderId" = "filteredServiceOrders"."id"
LEFT JOIN "filteredOrderLogs" "intakeLog"
        ON "intakeLog"."orderId" = "filteredServiceOrders"."id"
        AND "intakeLog"."status" = 'READY_FOR_PROCESSING'
LEFT JOIN "filteredOrderLogs" "washingLog"
        ON "washingLog"."orderId" = "filteredServiceOrders"."id"
        AND "washingLog"."status" IN ('PROCESSING', 'HUB_PROCESSING_ORDER')
LEFT JOIN "filteredOrderLogs" "dryingLog"
        ON "dryingLog"."orderId" = "filteredServiceOrders"."id"
        AND "dryingLog"."status" IN ('PROCESSING', 'HUB_PROCESSING_ORDER')
LEFT JOIN "filteredOrderLogs" "completeProcessingLog"
        ON "completeProcessingLog"."orderId" = "filteredServiceOrders"."id"
        AND "completeProcessingLog"."status" IN ('READY_FOR_PICKUP', 'HUB_PROCESSING_COMPLETE')
LEFT JOIN "filteredOrderLogs" "completeLog"
        ON "completeLog"."orderId" = "filteredServiceOrders"."id"
        AND "completeLog"."status" = 'COMPLETED'
ORDER BY "id"

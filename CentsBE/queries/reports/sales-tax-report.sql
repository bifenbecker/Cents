SELECT
  "taxRates".id,
  "taxRates".name AS "taxRateName",
  "taxRates".rate AS "taxRateRate",
  SUM("serviceOrders"."taxAmountInCents") AS "totalServiceTaxAmount",
  SUM("inventoryOrders"."salesTaxAmount") AS "totalProductTaxAmount",
  stores.name AS "storeName"
FROM "stores"
  INNER JOIN "taxRates" ON "taxRates".id = stores."taxRateId"
  INNER JOIN orders ON orders."storeId" = stores.id
  LEFT JOIN "serviceOrders" ON  "serviceOrders".id = orders."orderableId" AND orders."orderableType" = 'ServiceOrder' AND "serviceOrders".status = 'COMPLETED' AND "serviceOrders"."createdAt" BETWEEN '{{startDate}}' AND '{{endDate}}'
  LEFT JOIN "inventoryOrders" ON  "inventoryOrders".id = orders."orderableId" AND orders."orderableType" = 'InventoryOrder' AND "inventoryOrders".status = 'COMPLETED' AND "inventoryOrders"."createdAt" BETWEEN '{{startDate}}' AND '{{endDate}}'
WHERE stores.id in ({{storeIds}})
GROUP BY "taxRates".id, stores.id
ORDER BY "taxRates".id ASC
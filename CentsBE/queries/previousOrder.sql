SELECT so."id" FROM "serviceOrders" so
JOIN "orders" o
  ON o."orderableId" = so.id
  AND o."orderableType" in ('ServiceOrder','serviceOrder')
JOIN "orderDeliveries" od
  ON od."orderId" = o.id
  AND od."type" = 'PICKUP'
  AND od."status" IN ('COMPLETED', 'CANCELED', 'CANCELLED')
  AND od."postalCode" = '{{postalCode}}'
JOIN "storeCustomers" sc
  ON sc."businessId" = {{businessId}}
  AND sc.id = so."storeCustomerId"
  AND sc."centsCustomerId" = '{{customerId}}'
WHERE  so."orderType" = 'ONLINE'
  AND so."status" IN ('COMPLETED', 'CANCELED', 'CANCELLED')
ORDER BY so."createdAt" DESC
LIMIT 1

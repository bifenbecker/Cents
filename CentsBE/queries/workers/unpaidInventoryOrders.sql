SELECT
    "inventoryOrders".id AS "inventoryOrderId",
    "inventoryOrders"."storeId",
    orders.id,
    orders."orderableId",
    orders."orderableType",
    payments.id AS "paymentId"
FROM
    "inventoryOrders"
    INNER JOIN orders ON orders."orderableType" = 'InventoryOrder'
    AND orders."orderableId" = "inventoryOrders".id
    LEFT JOIN payments ON payments."orderId" = orders.id
WHERE
    "inventoryOrders"."paymentStatus" != 'PAID'
    AND "inventoryOrders"."status" NOT IN ('COMPLETED', 'CANCELLED', 'CANCELED')
    AND "inventoryOrders"."createdAt" < now() - interval '1 hours'
ORDER BY
    "inventoryOrders"."createdAt" DESC

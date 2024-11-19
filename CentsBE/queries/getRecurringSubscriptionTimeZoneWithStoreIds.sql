SELECT
    "storeSettings"."timeZone",
    ARRAY_AGG(DISTINCT "recurringSubscriptions".id) AS "recurringSubscriptionIds"
FROM "stores"
INNER JOIN "storeSettings"
        ON "storeSettings"."storeId" = "stores".id
INNER JOIN "recurringSubscriptions"
        ON "recurringSubscriptions"."storeId" = "stores".id
        AND "recurringSubscriptions"."deletedAt" IS NULL
GROUP BY "storeSettings"."timeZone"

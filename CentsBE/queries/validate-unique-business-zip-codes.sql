WITH "allActiveZipCodes" AS (
  SELECT array_agg("zipCodes") as "zipCodes", "ownDeliverySettingsId"
  FROM (
    SELECT
      unnest(array_agg("zones"."zipCodes")) AS "zipCodes",
      "zones"."ownDeliverySettingsId"
    FROM "zones"
    INNER JOIN "ownDeliverySettings" ON "ownDeliverySettings"."id" = "zones"."ownDeliverySettingsId"
    INNER JOIN "stores" ON "stores"."id" = "ownDeliverySettings"."storeId"
    WHERE "stores"."businessId" = {{businessId}}
      AND "ownDeliverySettings"."hasZones" IS TRUE
      AND "stores"."id" != {{currentStoreId}}
      AND "zones"."deletedAt" IS NULL
    GROUP BY "zones"."ownDeliverySettingsId"

    UNION

    SELECT
      unnest(array_agg("ownDeliverySettings"."zipCodes")) AS "zipCodes",
      "ownDeliverySettings"."id" AS "ownDeliverySettingsId"
    FROM "ownDeliverySettings"
    INNER JOIN "stores" ON "stores"."id" = "ownDeliverySettings"."storeId"
    WHERE "stores"."businessId" = {{businessId}}
      AND "ownDeliverySettings"."hasZones" IS FALSE
      AND "stores"."id" != {{currentStoreId}}
    GROUP BY "ownDeliverySettings"."id"
  ) sub
  GROUP BY sub."ownDeliverySettingsId"
)

SELECT NOT EXISTS (
  SELECT "allActiveZipCodes"."ownDeliverySettingsId"
  FROM "allActiveZipCodes"
  WHERE ARRAY[{{{zipCodes}}}] && "allActiveZipCodes"."zipCodes"
) AS "hasUniqueZipCodes"

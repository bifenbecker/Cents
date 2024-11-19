WITH "zoneZipCodes" AS (
  SELECT array_agg("zipCodes") AS "zipCodes", "ownDeliverySettingsId"
  FROM (
    SELECT
      unnest(zones."zipCodes") as "zipCodes",
      zones."ownDeliverySettingsId"
    FROM zones
    INNER JOIN "ownDeliverySettings" ON "ownDeliverySettings".id = zones."ownDeliverySettingsId"
    WHERE zones."deletedAt" IS NULL
    {{#storeId}}
      AND "ownDeliverySettings"."storeId" = {{storeId}}
    {{/storeId}}
  ) sub
  GROUP BY sub."ownDeliverySettingsId"
)
SELECT
  "stores"."id" as "id",
  "stores"."businessId",
  "stores"."name",
  "stores"."uberStoreUuid",
  "stores"."state",
  "stores"."type",
  "storeSettings"."googlePlacesId",
  "storeSettings"."turnAroundInHours",
  "ownDeliverySettings"."hasZones",
  CASE
    WHEN "ownDeliverySettings"."hasZones" IS TRUE THEN "zoneZipCodes"."zipCodes"
    ELSE "ownDeliverySettings"."zipCodes"
  END as "zipCodes",
  "storeSettings"."deliveryEnabled",
  "storeSettings"."recurringDiscountInPercent",
  "storeSettings"."autoScheduleReturnEnabled",
  "storeSettings"."customLiveLinkHeader",
  "storeSettings"."customLiveLinkMessage",
  "ownDeliverySettings"."active" AS "offersOwnDelivery",
  "ownDeliverySettings"."deliveryFeeInCents",
  "ownDeliverySettings"."returnDeliveryFeeInCents",
  "centsDeliverySettings"."active" AS "offersCentsDelivery",
  "centsDeliverySettings"."doorDashEnabled" AS "doorDashEnabled",
  "centsDeliverySettings"."subsidyInCents",
  "centsDeliverySettings"."returnOnlySubsidyInCents",
  jsonb_build_object(
    'lat',"storeSettings".lat,
    'lon',  "storeSettings".lng
  ) AS pin
FROM "stores"
LEFT JOIN "storeSettings" ON "storeSettings"."storeId" = "stores"."id"
LEFT JOIN "ownDeliverySettings" ON "ownDeliverySettings"."storeId" = "stores"."id"
LEFT JOIN "zoneZipCodes" ON "zoneZipCodes"."ownDeliverySettingsId" = "ownDeliverySettings"."id"
LEFT JOIN "centsDeliverySettings" ON "centsDeliverySettings"."storeId" = "stores"."id"
{{#storeId}}
WHERE "stores"."id" = {{storeId}}
{{/storeId}}

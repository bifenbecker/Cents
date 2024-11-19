WITH "daysWithSorting" AS (
  SELECT
    "day",
    CASE
      WHEN "day"::INT = {{currentDay}}::INT
        THEN 0
      WHEN "day"::INT > {{currentDay}}::INT
        THEN "day"::INT - {{currentDay}}::INT
      ELSE
        7 + "day"::INT - {{currentDay}}::INT
    END AS "daySortIndex"
  FROM (
    SELECT DISTINCT "timings"."day"
    FROM "timings"
    ORDER BY "timings"."day" ASC
  ) AS "days"
  ORDER BY "daySortIndex"
),
"ownDeliveryTimings" AS (
	SELECT
    "timings".*,
    "shifts"."storeId",
    "zoneTimingZipCodes"."zipCodes" AS "zoneTimingSpecificZipCodes"
  FROM "timings"
  INNER JOIN "shifts" ON "shifts"."id" = "timings"."shiftId"
  LEFT JOIN LATERAL (
    SELECT array_agg("sub"."unnestedZipCodes") AS "zipCodes"
    FROM (
      SELECT unnest("zones"."zipCodes") AS "unnestedZipCodes"
      FROM "shiftTimingZones"
      LEFT OUTER JOIN "zones" ON "zones"."id" = ANY("shiftTimingZones"."zoneIds")
      WHERE "shiftTimingZones"."timingId" = "timings"."id"
    ) AS "sub"
  ) AS "zoneTimingZipCodes" ON TRUE
  WHERE "shifts"."type" = 'OWN_DELIVERY'
    AND "timings"."isActive" IS TRUE
    {{#storeIds}}
    AND "shifts"."storeId" IN ({{storeIds}})
    {{/storeIds}}
),
"pastOrderDeliveries" AS (
  SELECT
    "orderDeliveries"."id",
    "orderDeliveries"."postalCode",
    "orderDeliveries"."storeId",
    "storeSettings"."timeZone"
  FROM "orderDeliveries"
  INNER JOIN "stores" ON "stores"."id" = "orderDeliveries"."storeId"
  INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "stores"."id"
  WHERE "orderDeliveries".status = 'SCHEDULED'
    {{#storeIds}}
    AND "stores"."id" IN ({{storeIds}})
    {{/storeIds}}
    AND "orderDeliveries"."deliveryProvider" = 'OWN_DRIVER'
    AND (
      to_timestamp("orderDeliveries"."deliveryWindow" [2] / 1000.0) AT TIME ZONE COALESCE("storeSettings"."timeZone", 'America/New_York')
    ) < (
      NOW() AT TIME ZONE COALESCE("storeSettings"."timeZone", 'America/New_York')
    )
    AND "storeSettings"."deliveryEnabled" IS TRUE
  ORDER BY "orderDeliveries"."id"
)

SELECT
  "pastOrderDeliveries"."id",
  "pastOrderDeliveries"."storeId",
  "pastOrderDeliveries"."timeZone",
  "pastOrderDeliveries"."postalCode",
  "newTimings"."id" AS "newTimingId",
  "newTimings"."day",
  "newTimings"."startTime",
  "newTimings"."endTime",
  "newTimings"."daySortIndex"
FROM "pastOrderDeliveries"
INNER JOIN "ownDeliverySettings"
        ON "ownDeliverySettings"."storeId" = "pastOrderDeliveries"."storeId"
LEFT JOIN LATERAL (
  SELECT
    "subQuery"."id",
     COALESCE("subQuery"."day", "daysWithSorting"."day") AS "day",
    "subQuery"."startTime",
    "subQuery"."endTime",
    "daysWithSorting"."daySortIndex"
  FROM "daysWithSorting"
  LEFT JOIN LATERAL (
    SELECT
      "ownDeliveryTimings"."id",
      "ownDeliveryTimings"."day",
      "ownDeliveryTimings"."startTime",
      "ownDeliveryTimings"."endTime"
    FROM "ownDeliveryTimings"
    WHERE "ownDeliveryTimings"."storeId" = "pastOrderDeliveries"."storeId"
      AND "ownDeliveryTimings"."day" = "daysWithSorting"."day"
      AND ("ownDeliveryTimings"."startTime")::TIME > (
        NOW() AT TIME ZONE COALESCE("pastOrderDeliveries"."timeZone", 'America/New_York')
      )::TIME
      AND (
        CASE
          WHEN "ownDeliverySettings"."hasZones"
            THEN (
              array_length("ownDeliveryTimings"."zoneTimingSpecificZipCodes", 1) > 0
              AND "pastOrderDeliveries"."postalCode" = ANY("ownDeliveryTimings"."zoneTimingSpecificZipCodes")
            )
          ELSE
            (
              array_length("ownDeliverySettings"."zipCodes", 1) > 0
              AND "pastOrderDeliveries"."postalCode" = ANY("ownDeliverySettings"."zipCodes")
            )
        END
      )
      AND "ownDeliveryTimings"."id" IS NOT NULL
    ORDER BY "ownDeliveryTimings"."startTime" ASC
    LIMIT 1
  ) AS "subQuery" ON TRUE
  WHERE "subQuery"."id" IS NOT NULL
  LIMIT 1
) AS "newTimings" ON TRUE
{{#storeIds}}
WHERE "pastOrderDeliveries"."storeId" IN ({{storeIds}})
{{/storeIds}}

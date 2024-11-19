WITH

"getDOW" AS (
	SELECT EXTRACT(
		DOW
		from
		(
			to_timestamp({{startTime}})::timestamp AT TIME ZONE '{{{timeZone}}}'
		)
	) AS "currentDOW"
),

"nextSevenDays" AS (
	SELECT
		(
			(
				to_timestamp({{startTime}}) + (interval '1 day' * days."daySortIndex")
			)::timestamp AT TIME ZONE '{{{timeZone}}}'
		) AS current_date,
		EXTRACT(
			EPOCH
			FROM
			to_timestamp({{startTime}}) + (interval '1 day' * days."daySortIndex")
		) AS current_date_in_unix,
		"day"
	FROM (
		SELECT
			"day",
			CASE
				WHEN "day"::INT = "getDOW"."currentDOW"::INT THEN 0
				WHEN "day"::INT > "getDOW"."currentDOW"::INT THEN "day"::INT - "getDOW"."currentDOW"::INT
				ELSE 7 + "day"::INT - "getDOW"."currentDOW"::INT
			END AS "daySortIndex"
		FROM (
			SELECT DISTINCT "timings"."day" FROM "timings"
			ORDER BY "timings"."day" ASC
		) AS "days"
		LEFT JOIN "getDOW" ON TRUE
		ORDER BY "daySortIndex"
	) AS days
),

"activeOrderDeliveriesWithSubscriptionId" AS (
	SELECT "orderDeliveries".*, "serviceOrderRecurringSubscriptions"."recurringSubscriptionId"
	FROM "orderDeliveries"
	INNER JOIN "orders"
		ON "orders"."id" = "orderDeliveries"."orderId"
	INNER JOIN "serviceOrders"
		ON "orders"."orderableId" = "serviceOrders"."id"
		AND "orders"."orderableType" = 'ServiceOrder'
	LEFT JOIN "serviceOrderRecurringSubscriptions"
		ON "serviceOrderRecurringSubscriptions"."serviceOrderId" = "serviceOrders"."id"
	WHERE "orderDeliveries"."storeId" = {{storeId}}
),

"zipCodesAndZonesAvailability" AS (
	SELECT
		"ownDeliverySettings"."id",
		"ownDeliverySettings"."storeId",
		"ownDeliverySettings"."hasZones",
		'{{zipCode}}' = ANY("ownDeliverySettings"."zipCodes") AS "hasZipCode",
		ARRAY_AGG(DISTINCT zones.id) AS "zoneIdsWithZipcode" 
	FROM "ownDeliverySettings"
	LEFT JOIN zones
		ON zones."ownDeliverySettingsId" = "ownDeliverySettings".id
		AND '{{zipCode}}' = ANY(zones."zipCodes")
	WHERE "ownDeliverySettings"."storeId" = {{storeId}}
	GROUP BY "ownDeliverySettings".id
)

SELECT
	"nextSevenDays".*,
	JSON_AGG(
		availableTimings.*
		ORDER BY availableTimings."startTime", availableTimings."endTime"
	) FILTER (
		WHERE
		availableTimings."id" IS NOT NULL
		AND availableTimings."serviceType" IS NOT NULL
	) AS timings

FROM "nextSevenDays"

INNER JOIN timings
	ON timings.day::INT = "nextSevenDays".day::INT
	AND timings."isActive" = TRUE

INNER JOIN shifts
	ON shifts.id = timings."shiftId"
	AND shifts."deletedAt" IS NULL

INNER JOIN "zipCodesAndZonesAvailability"
	ON "zipCodesAndZonesAvailability"."storeId" = "shifts"."storeId"

LEFT JOIN "shiftTimingZones"
	ON "shiftTimingZones"."timingId" = "timings"."id"

INNER JOIN "storeSettings"
	ON "storeSettings"."storeId" = "shifts"."storeId"

LEFT JOIN LATERAL (
	SELECT
		id,
		"startTime",
		"endTime",
		"maxStops",
		"serviceType"[1],
		COALESCE("orderDeliveriesCount", 0) AS "orderDeliveriesCount",
		COALESCE(
			ARRAY_LENGTH(
				ARRAY_REMOVE(
					ARRAY(
						SELECT UNNEST("totalRecurringSusbscriptions")
						EXCEPT
						SELECT UNNEST("recurringSubscriptionsFromOrderDeliveries")
					),
					NULL
				),
				1
			),
			0
		) AS "recurringSubscriptionCount"

	FROM (
		SELECT
			timings.*,
			MAX("deliveryTimingSettings"."maxStops") AS "maxStops",
			ARRAY_AGG(DISTINCT "deliveryTimingSettings"."serviceType") AS "serviceType",
			ARRAY_REMOVE(
				ARRAY_AGG(DISTINCT "activeOrderDeliveriesWithSubscriptionId"."recurringSubscriptionId"),
				NULL
			) AS "recurringSubscriptionsFromOrderDeliveries",
			ARRAY_AGG(DISTINCT "recurringSubscriptions"."id") AS "totalRecurringSusbscriptions",
			COUNT(
				DISTINCT(
					CASE 
						WHEN "activeOrderDeliveriesWithSubscriptionId"."status" NOT IN ('CANCELED', 'CANCELLED')
							THEN "activeOrderDeliveriesWithSubscriptionId"."id"
					END
				)
			) AS "orderDeliveriesCount"

		FROM "deliveryTimingSettings"

		LEFT JOIN "activeOrderDeliveriesWithSubscriptionId"
			ON "activeOrderDeliveriesWithSubscriptionId"."timingsId" = "timings"."id"
			AND (
				CASE
					WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN TRUE -- Fetch all orderDeliveries if serviceType is ALL
					ELSE "activeOrderDeliveriesWithSubscriptionId"."type" = '{{serviceType}}'
				END IS TRUE
			)
			-- Doing this check so that we only get deliveries for that specific date.
			AND DATE(
				to_timestamp("activeOrderDeliveriesWithSubscriptionId"."deliveryWindow"[1] / 1000) at time zone "storeSettings"."timeZone"
			) = DATE("nextSevenDays".current_date)

		LEFT JOIN "recurringSubscriptions"
			-- join with timingsId
			ON (
				CASE
					WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN (
						"timings"."id" = ANY(ARRAY[
							"recurringSubscriptions"."pickupTimingsId",
							"recurringSubscriptions"."returnTimingsId"
						])
					)
					WHEN '{{serviceType}}' = 'PICKUP' AND "recurringSubscriptions"."pickupTimingsId" = "timings"."id" THEN TRUE
					WHEN '{{serviceType}}' = 'RETURN' AND "recurringSubscriptions"."returnTimingsId" = "timings"."id" THEN TRUE
					ELSE FALSE
				END IS TRUE
			)
			-- check the date of week being same as current date.
			AND (
				CASE
					WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN (
						"nextSevenDays".day = ANY(ARRAY[
							EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone "storeSettings"."timeZone"))::text,
							EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone "storeSettings"."timeZone"))::text
						])
					)
					WHEN '{{serviceType}}' = 'PICKUP' THEN EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone "storeSettings"."timeZone"))::text = "nextSevenDays".day
					WHEN '{{serviceType}}' = 'RETURN' THEN EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone "storeSettings"."timeZone"))::text = "nextSevenDays".day
					ELSE FALSE
				END IS TRUE
			)
			-- Subscription should not be deleted
			AND "recurringSubscriptions"."deletedAt" IS NULL
			-- That date should not be canceled/skipped.
			AND (
				"recurringSubscriptions"."cancelledPickupWindows" IS NULL
				OR ARRAY_LENGTH("recurringSubscriptions"."cancelledPickupWindows", 1) = 0
				OR DATE(
					to_timestamp(
						("recurringSubscriptions"."cancelledPickupWindows"[array_upper("recurringSubscriptions"."cancelledPickupWindows", 1)]) / 1000
					) AT TIME ZONE "storeSettings"."timeZone"
				) <> DATE("nextSevenDays".current_date)
			)

		WHERE "deliveryTimingSettings"."timingsId" = "timings"."id"
			AND "deliveryTimingSettings"."serviceType" IN ('{{serviceType}}', 'ALL')
			AND timings."isActive" IS TRUE
			AND timings.id IS NOT NULL
			AND (
				CASE 
					WHEN "zipCodesAndZonesAvailability"."hasZones" = TRUE
						THEN "zipCodesAndZonesAvailability"."zoneIdsWithZipcode" && "shiftTimingZones"."zoneIds"
					ELSE "zipCodesAndZonesAvailability"."hasZipCode"
				END
			) IS TRUE
	) AS availableTimingsBeforeAgg
) AS availableTimings ON TRUE

WHERE
	"shifts"."storeId" = {{storeId}}
	AND "shifts".type = 'OWN_DELIVERY'

GROUP BY
	"nextSevenDays".day,
	"nextSevenDays".current_date,
	current_date_in_unix

ORDER BY
	"nextSevenDays".current_date

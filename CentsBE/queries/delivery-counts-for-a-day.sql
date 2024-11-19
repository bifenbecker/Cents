WITH "activeOrderDeliveriesWithSubscriptionId" AS (
    SELECT
        "orderDeliveries".*,
        "serviceOrderRecurringSubscriptions"."recurringSubscriptionId"
    FROM
        "orderDeliveries"
        INNER JOIN "orders" ON "orders"."id" = "orderDeliveries"."orderId"
        INNER JOIN "serviceOrders" ON "orders"."orderableId" = "serviceOrders"."id"
        AND "orders"."orderableType" = 'ServiceOrder'
        LEFT JOIN "serviceOrderRecurringSubscriptions" ON "serviceOrderRecurringSubscriptions"."serviceOrderId" = "serviceOrders"."id"
    WHERE
        "orderDeliveries"."timingsId" = {{timingId}}
),
"currentTimeDetails" AS (
    SELECT
        DATE(
            to_timestamp({{startTime}}) at time zone '{{{timeZone}}}'
        ) as "date",
        EXTRACT(
            DOW
            FROM
                DATE(
                    to_timestamp(
                        {{startTime}}
                    ) at time zone '{{{timeZone}}}'
                )
        ) :: text AS day
)
SELECT
    timings.id,
    "maxStops",
    "orderDeliveriesCount",
    COALESCE(
        ARRAY_LENGTH(
            ARRAY_REMOVE(
                ARRAY(
                    SELECT
                        UNNEST("totalRecurringSusbscriptions")
                    EXCEPT
                    SELECT
                        UNNEST("recurringSubscriptionsFromOrderDeliveries")
                ),
                NULL
            ),
            1
        ),
        0
    ) AS "recurringSubscriptionCount"
FROM
    timings
    LEFT JOIN "currentTimeDetails" ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            timings.*,
            MAX("deliveryTimingSettings"."maxStops") AS "maxStops",
            ARRAY_AGG(DISTINCT "deliveryTimingSettings"."serviceType") AS "serviceType",
            ARRAY_REMOVE(
                ARRAY_AGG(
                    DISTINCT "activeOrderDeliveriesWithSubscriptionId"."recurringSubscriptionId"
                ),
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
        FROM
            "deliveryTimingSettings"
            LEFT JOIN "activeOrderDeliveriesWithSubscriptionId" ON "activeOrderDeliveriesWithSubscriptionId"."timingsId" = "timings"."id"
            AND (
                CASE
                    WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN TRUE -- Fetch all orderDeliveries if serviceType is ALL
                    ELSE "activeOrderDeliveriesWithSubscriptionId"."type" = '{{serviceType}}'
                END IS TRUE
            )
            AND DATE(
                to_timestamp(
                    "activeOrderDeliveriesWithSubscriptionId"."deliveryWindow" [1] / 1000
                ) at time zone '{{{timeZone}}}'
            ) = "currentTimeDetails"."date" -- Doing this check so that we only get deliveries for that specific date.
            LEFT JOIN "recurringSubscriptions" ON (
                CASE
                    WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN (
                        "timings"."id" = ANY(
                            ARRAY [
							"recurringSubscriptions"."pickupTimingsId",
							"recurringSubscriptions"."returnTimingsId"
						]
                        )
                    )
                    WHEN '{{serviceType}}' = 'PICKUP'
                    AND "recurringSubscriptions"."pickupTimingsId" = "timings"."id" THEN TRUE
                    WHEN '{{serviceType}}' = 'RETURN'
                    AND "recurringSubscriptions"."returnTimingsId" = "timings"."id" THEN TRUE
                    ELSE FALSE
                END IS TRUE
            ) -- join with timingsId
            AND (
				CASE
					WHEN "deliveryTimingSettings"."serviceType" = 'ALL' THEN (
						"currentTimeDetails".day = ANY(ARRAY[
							EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone '{{{timeZone}}}'))::text,
							EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone '{{{timeZone}}}'))::text
						])
					)
					WHEN '{{serviceType}}' = 'PICKUP' THEN EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."pickupWindow"[1] / 1000) at time zone '{{{timeZone}}}'))::text = "currentTimeDetails".day
					WHEN '{{serviceType}}' = 'RETURN' THEN EXTRACT(DOW FROM DATE(to_timestamp("recurringSubscriptions"."returnWindow"[1] / 1000) at time zone '{{{timeZone}}}'))::text = "currentTimeDetails".day
					ELSE FALSE
				END IS TRUE
			) -- check the date of week being same as current date.
            AND "recurringSubscriptions"."deletedAt" IS NULL -- Subscription should not be deleted
            AND (
                "recurringSubscriptions"."cancelledPickupWindows" IS NULL
                OR ARRAY_LENGTH(
                    "recurringSubscriptions"."cancelledPickupWindows",
                    1
                ) = 0
                OR DATE(
                    to_timestamp(
                        (
                            "recurringSubscriptions"."cancelledPickupWindows" [array_upper("recurringSubscriptions"."cancelledPickupWindows", 1)]
                        ) / 1000
                    ) AT TIME ZONE '{{{timeZone}}}'
                ) <> "currentTimeDetails"."date"
            ) -- That date should not be canceled/skipped.
        WHERE
            "deliveryTimingSettings"."timingsId" = "timings"."id"
            AND "deliveryTimingSettings"."serviceType" IN ('{{serviceType}}', 'ALL')
            AND timings."isActive" IS TRUE
            AND timings.id IS NOT NULL
    ) AS availableTimingsBeforeAgg ON TRUE
WHERE
    timings.id = {{timingId}}
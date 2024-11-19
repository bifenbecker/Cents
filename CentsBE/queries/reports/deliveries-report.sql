SELECT * FROM(
  SELECT 
    (to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone") AS "date_with_time",
    TO_CHAR(to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'Mon DD') AS "Date",
    "shifts".name AS "Window Name",
    concat(TO_CHAR(to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam'), ' - ', TO_CHAR(to_timestamp("orderDeliveries"."deliveryWindow"[2] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam')) AS "Time",
    "serviceOrders"."orderCode" AS "Order Number",
    TO_CHAR("serviceOrders"."placedAt" AT TIME ZONE "storeSettings"."timeZone", 'YYYY-MM-DD HH:MIam') AS "Submitted Time", 
    CASE 
      WHEN "serviceOrders"."orderType" = 'ONLINE' AND "intakeLog"."updatedAt" IS NOT NULL THEN TO_CHAR("intakeLog"."updatedAt" AT TIME ZONE "storeSettings"."timeZone", 'YYYY-MM-DD HH:MIam')
      WHEN "serviceOrders"."orderType" = 'ONLINE' THEN 'Intake not Complete'
      ELSE 'Walk-in' END AS "Intake Time", 
    "orderDeliveries".status AS "Status",
    INITCAP("orderDeliveries".type) AS "Pickup or Delivery",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'OWN_DRIVER' THEN 'Standard' ELSE 'On Demand' END AS "Delivery Provider",
    CONCAT("storeCustomers"."firstName",' ',"storeCustomers"."lastName") AS "Customer Name",
    CONCAT("orderDeliveries".address1, CHR(10), CASE WHEN "orderDeliveries".address2 IS NOT NULL THEN CONCAT("orderDeliveries".address2, CHR(10)) ELSE NULL END, "orderDeliveries".city, ',', "orderDeliveries"."firstLevelSubdivisionCode", CHR(10), "orderDeliveries"."postalCode", ',',"orderDeliveries"."countryCode") AS "Customer Address",
    "storeCustomers"."phoneNumber" AS "Phone Number", 
    "orderDeliveries".instructions->>'leaveAtDoor' AS "leave At Door",
    "orderDeliveries".instructions->>'instructions' AS "Delivery Instructions",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'OWN_DRIVER' THEN CAST((CASE WHEN "orderDeliveries"."totalDeliveryCost" = 'NaN' THEN 0 ELSE "orderDeliveries"."totalDeliveryCost" END)::NUMERIC AS MONEY)::text ELSE NULL END AS "Own Driver Fee",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'DOORDASH' THEN CAST((CASE WHEN "orderDeliveries"."thirdPartyDeliveryCostInCents" IS NULL THEN 0 ELSE "orderDeliveries"."thirdPartyDeliveryCostInCents"/100.00 END)::NUMERIC AS MONEY)::text ELSE NULL END AS "On Demand Cost",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'DOORDASH' THEN CAST(("orderDeliveries"."subsidyInCents" / 100.00) AS MONEY)::text ELSE NULL END AS "Subsidy", 
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'DOORDASH'
      THEN CAST(
        ((CASE WHEN "orderDeliveries"."thirdPartyDeliveryCostInCents" IS NULL
          THEN 0
          ELSE "orderDeliveries"."thirdPartyDeliveryCostInCents"/100.00 END) - (CASE WHEN "orderDeliveries"."thirdPartyDeliveryCostInCents" IS NOT NULL AND ("orderDeliveries"."subsidyInCents" >= "orderDeliveries"."thirdPartyDeliveryCostInCents") THEN "orderDeliveries"."thirdPartyDeliveryCostInCents"/100.00 ELSE ("orderDeliveries"."subsidyInCents" / 100.00) END))::NUMERIC::MONEY AS MONEY)::text ELSE NULL END AS "Customer Paid",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'DOORDASH' THEN CAST("orderDeliveries"."courierTip"::NUMERIC AS MONEY)::text ELSE NULL END AS "DoorDash Tip (Customer Paid)",
    CASE WHEN "orderDeliveries"."deliveryProvider" = 'DOORDASH' AND "orderDeliveries"."firstLevelSubdivisionCode" = 'CA' THEN  '$2.00' ELSE NULL END AS "CA Driver Fee",
    "stores".name AS "Location"

  FROM "orderDeliveries"
  INNER JOIN "timings" ON "timings".id = "orderDeliveries"."timingsId"
  INNER JOIN "shifts" ON "shifts".id = "timings"."shiftId"
  INNER JOIN "orders" ON "orders".id = "orderDeliveries"."orderId"
  INNER JOIN "serviceOrders" ON "serviceOrders".id = "orders"."orderableId" AND "orders"."orderableType" = 'ServiceOrder'
  INNER JOIN "storeCustomers" ON "storeCustomers".id = "serviceOrders"."storeCustomerId"
  INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "storeCustomers"."storeId"
  INNER JOIN "stores" ON "stores"."id" = "storeSettings"."storeId"
  LEFT JOIN "orderActivityLog" AS "intakeLog" ON "intakeLog"."orderId" = "serviceOrders".id AND "intakeLog".status = 'READY_FOR_PROCESSING'
  WHERE "orderDeliveries".status NOT IN ('CANCELLED', 'CANCELED') 
    AND "serviceOrders"."storeId" IN ({{storeIds}})
    AND CAST(to_timestamp("orderDeliveries"."deliveryWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone" AS DATE) between '{{startDate}}' and '{{endDate}}'
    {{#ownDriver}}
      AND "orderDeliveries"."deliveryProvider" = 'OWN_DRIVER'
    {{/ownDriver}}
    {{#doordash}}
      AND "orderDeliveries"."deliveryProvider" = 'DOORDASH'
    {{/doordash}}
  {{#futureStartDate}}
    UNION
    SELECT 
        date_with_time,
        "Date",
        shift_name,
        pickup_time_range,
        'Future Order - No Value Yet', --Order Number
        '--', --Submitted Time
        '--', --Intake Time
        '--', --Status
        type,
        "Delivery Provider",
        "Customer Name",
        "Customer Address",
        "Phone Number",
        "leave At Door"::text,
        "Delivery Instructions",
        '--', --Own Driver Fee
        '--', --On Demand Cost
        '--', --Subsidy
        '--', --Customer Paid
        '--', --DoorDash Tip (Customer Paid)
        '--', --CA Driver Fee
        "Location"

      FROM (
        SELECT * FROM
        (
          WITH future_subscriptions AS ( --fetch active subscriptions for the given storeIds
            SELECT 
              "recurringSubscriptions".*, "storeSettings"."timeZone" AS "timeZone", EXTRACT(DOW FROM DATE((to_timestamp("pickupWindow"[1] / 1000) AT TIME ZONE "timeZone"))) AS pickup_day, EXTRACT(DOW FROM DATE((to_timestamp("returnWindow"[1] / 1000) AT TIME ZONE "timeZone"))) AS return_day,
              TO_CHAR(to_timestamp("pickupWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam') AS pickup_time,
              TO_CHAR(to_timestamp("returnWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam') AS delivery_time,
              CONCAT(TO_CHAR(to_timestamp("pickupWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam'), ' - ', TO_CHAR(to_timestamp("pickupWindow"[2] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam')) AS pickup_time_range,
              CONCAT(TO_CHAR(to_timestamp("returnWindow"[1] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam'), ' - ', TO_CHAR(to_timestamp("returnWindow"[2] / 1000) AT TIME ZONE "storeSettings"."timeZone", 'HH:MIam')) AS delivery_time_range,
              shifts.name AS shift_name,
              delivery_shift.name AS delivery_shift_name,
              CONCAT("centsCustomers"."firstName",' ',"centsCustomers"."lastName") AS "Customer Name",
              CONCAT("centsCustomerAddresses".address1, CHR(10), CASE WHEN "centsCustomerAddresses".address2 IS NOT NULL THEN CONCAT("centsCustomerAddresses".address2, CHR(10)) ELSE NULL END, "centsCustomerAddresses".city, ',', "centsCustomerAddresses"."firstLevelSubdivisionCode", CHR(10), "centsCustomerAddresses"."postalCode", ',',"centsCustomerAddresses"."countryCode") AS "Customer Address",
              "centsCustomers"."phoneNumber" AS "Phone Number",
              "centsCustomerAddresses"."leaveAtDoor" AS "leave At Door",
              "centsCustomerAddresses".instructions AS "Delivery Instructions",
              CASE WHEN shifts.type = 'OWN_DELIVERY' THEN 'Standard' ELSE 'On Demand' END AS "Pickup Delivery Provider",
              CASE WHEN delivery_shift.type = 'OWN_DELIVERY' THEN 'Standard' ELSE (CASE WHEN delivery_shift.type IS NOT NULL THEN 'On Demand' ELSE '' END) END AS "Return Delivery Provider",
              "returnWindow"[1], substring(substring("recurringSubscriptions"."recurringRule" FROM 'INTERVAL=\d{1}') FROM '\d{1}')::int AS frequency,
              "stores".name AS "Location"
            FROM "recurringSubscriptions"
            INNER JOIN "storeSettings" ON "storeSettings"."storeId" = "recurringSubscriptions"."storeId"
            INNER JOIN "stores" ON "stores"."id" = "storeSettings"."storeId"
            INNER JOIN "centsCustomers" ON "centsCustomers".id = "recurringSubscriptions"."centsCustomerId"
            INNER JOIN "centsCustomerAddresses" ON "centsCustomerAddresses".id = "recurringSubscriptions"."centsCustomerAddressId"
            INNER JOIN timings ON timings.id = "recurringSubscriptions"."pickupTimingsId"
            LEFT JOIN timings AS delivery_timing ON delivery_timing.id = "recurringSubscriptions"."returnTimingsId"
            INNER JOIN shifts ON shifts.id = timings."shiftId"
            LEFT JOIN shifts AS delivery_shift ON delivery_shift.id = delivery_timing."shiftId"
            where "recurringSubscriptions"."deletedAt" is null
              AND "recurringSubscriptions"."storeId" IN ({{storeIds}})
          ),
          future_dates AS( --build future dates for each timezone based on user selected date range
            SELECT distinct "storeSettings"."timeZone", GENERATE_SERIES('{{futureStartDate}}', '{{futureEndDate}}', '1 day'::INTERVAL) AS date_in_timezone
            FROM "storeSettings"
            INNER JOIN future_subscriptions ON future_subscriptions."storeId" = "storeSettings"."storeId"
          ),
          dates_with_day AS( --extact date, day from the above generated dates
            SELECT *, date_in_timezone::date AS week_date, EXTRACT(DOW FROM date_in_timezone::date) AS day_from_date 
            FROM future_dates
          ),
          subscription_with_all_pickup_dates AS( --filter the dates that matches with pickup day(from timings) with row number
            SELECT 
              shift_name, future_subscriptions.id, week_date, future_subscriptions.frequency, pickup_day, pickup_time, pickup_time_range,
              "Customer Name", "Customer Address", "Phone Number", "leave At Door", "Delivery Instructions", "Pickup Delivery Provider" AS "Delivery Provider",
              ROW_NUMBER() OVER(PARTITION BY future_subscriptions.id ORDER BY future_subscriptions.id, week_date asc) rownumber, 
              "Location"
            FROM future_subscriptions
            INNER JOIN dates_with_day ON dates_with_day."timeZone" = future_subscriptions."timeZone" and dates_with_day.day_from_date = future_subscriptions.pickup_day
            order by future_subscriptions.id, week_date
          ),
          min_and_max_indexes AS ( --find min and max row number for each scubscription
            SELECT id AS subscription_id, min(rownumber) AS min_index, max(rownumber) AS max_index 
            FROM subscription_with_all_pickup_dates
            group by id
          ),
          subscription_with_all_delivery_dates AS( --filter the dates that matches with return day(from timings) with row number
            SELECT 
              delivery_shift_name, future_subscriptions.id, week_date, future_subscriptions.frequency,return_day, delivery_time, delivery_time_range,
              "Customer Name", "Customer Address", "Phone Number", "leave At Door", "Delivery Instructions","Return Delivery Provider",
              ROW_NUMBER() OVER(PARTITION BY future_subscriptions.id ORDER BY future_subscriptions.id, week_date asc) rownumber, 
              "Location"
            FROM future_subscriptions
            INNER JOIN dates_with_day ON dates_with_day."timeZone" = future_subscriptions."timeZone" and dates_with_day.day_from_date = future_subscriptions.return_day
            order by future_subscriptions.id, week_date
          ),
          subscription_pickup_row_indexes AS ( --generate indexs that matches with interval/frequency. Ex: when frequency =1 then 1,2,3,4.., when frequency=2 then 1,3,5, when frequency=4 then 1,4,8.,
            SELECT array(SELECT i FROM generate_series(min_index,max_index, frequency) i) AS matched_indexes, subscription_id 
            FROM min_and_max_indexes
            INNER JOIN future_subscriptions ON future_subscriptions.id = subscription_id
          ),
          cancelled_pickups AS( --get cancelled pickup dates
            SELECT *, unnest("cancelledPickupWindows") AS canceled_window, CAST(to_timestamp("pickupWindow"[1] / 1000) AT TIME ZONE "timeZone" AS DATE) AS canceled_date 
            FROM future_subscriptions
            where "cancelledPickupWindows" is not null
          ),
          active_row_indexes AS ( --exclude cancelled pickup dates and return the matched row indexes for each subscription
            SELECT subscription_pickup_row_indexes.*,  rownumber 
            FROM subscription_with_all_pickup_dates
            INNER JOIN subscription_pickup_row_indexes ON subscription_pickup_row_indexes.subscription_id  = subscription_with_all_pickup_dates.id
            LEFT JOIN cancelled_pickups ON cancelled_pickups.id = subscription_with_all_pickup_dates.id
            WHERE rownumber = ANY (matched_indexes) AND (cancelled_pickups.canceled_date is null OR cancelled_pickups.canceled_date != week_date)
          ),
          subscription_with_filtered_pickup_dates AS ( --generate data for all pickups
            SELECT 
              CONCAT(week_date, ' ', subscription_with_all_pickup_dates.pickup_time)::timestamp AS date_with_time,
              TO_CHAR(week_date, 'Mon DD') AS "Date",
              subscription_with_all_pickup_dates.*, 'Pickup' AS type 
            FROM subscription_with_all_pickup_dates
            INNER JOIN subscription_pickup_row_indexes ON subscription_pickup_row_indexes.subscription_id  = subscription_with_all_pickup_dates.id
            INNER JOIN active_row_indexes ON active_row_indexes.subscription_id  = subscription_with_all_pickup_dates.id and active_row_indexes.rownumber = subscription_with_all_pickup_dates.rownumber
          ),
          subscription_with_filtered_delivery_dates AS ( --generate data for all deliveries and exlude if pickup was cancelled
            SELECT 
              CONCAT(week_date, ' ', subscription_with_all_delivery_dates.delivery_time)::timestamp AS date_with_time,
              TO_CHAR(week_date, 'Mon DD') AS "Date",
              subscription_with_all_delivery_dates.*, 'Return' AS type 
            FROM subscription_with_all_delivery_dates
            INNER JOIN active_row_indexes ON active_row_indexes.subscription_id  = subscription_with_all_delivery_dates.id and active_row_indexes.rownumber = subscription_with_all_delivery_dates.rownumber
          )
          SELECT * FROM subscription_with_filtered_pickup_dates
          UNION
          SELECT * FROM subscription_with_filtered_delivery_dates
        ) AS future_pickup_anddelivery_intents
      {{#ownDriver}}
        WHERE "Delivery Provider" = 'Standard'
      {{/ownDriver}}
      {{#doordash}}
        WHERE "Delivery Provider" = 'On Demand'
      {{/doordash}}
    ) AS subscription_pickup_anddelivery_intents
  {{/futureStartDate}}
) AS deliveris_report_data
ORDER BY date_with_time ASC
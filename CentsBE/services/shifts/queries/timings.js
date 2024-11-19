const CustomQuery = require('../../customQuery');
const { shiftType } = require('../../../constants/constants');
const Timings = require('../../../models/timings');

const { mapTimingsAccordingToDays, mapTimings } = require('./mappers');

async function getOwnDeliveryWindow(stores, timeZone, transaction) {
    const query = `
    select to_char(sub."startTime", 'FMHH12:MI am') as "startTime",
    to_char(sub."startTime" + interval '1 hour', 'FMHH12:MI am') as "endTime",
    extract( epoch from
            (sub.date|| ' '|| sub."startTime")::timestamp
        ) as "startEpochTime",
     extract( epoch from
            (sub.date|| ' '|| sub."startTime")::timestamp + interval '1 hour') as "endEpochTime",
     sub.day,
     sub.formatted_date as date,
     sub."startDay",
     sub."endDay", 
     "timingId"
    from
    ( with shift_timings AS(
        select (timings."startTime")::time as "startTime",
           (timings."endTime")::time as "endTime", timings."endTime"::date as "endDate",
            "timings"."day"::int as timings_day, timings.id as "timingId", 
           case when timings."endTime"::date = '1970-01-02'  then true else false end as "nextDay",
           "shifts".name as shift_name, "shifts"."storeId" as "storeId" from "timings" 
           inner join "shifts" on "shifts"."id" = "timings"."shiftId" 
           and "shifts"."type" = 'OWN_DELIVERY' where "shifts"."storeId" in (${stores})
           and "timings"."isActive" = true
       ),
         one_week_from_now AS(
            SELECT (now() at time zone '${timeZone || 'UTC'}')::date + s.a AS date, 
            EXTRACT(DOW FROM (now() at time zone '${timeZone || 'UTC'}')::date + s.a) as day,
            ((now() at time zone '${timeZone || 'UTC'}')::date = (now() at time zone '${
        timeZone || 'UTC'
    }')::date + s.a)
              as current_day FROM generate_series(0,7) AS s(a)
       )
        select "timingId",((now() + interval '30 min') at time zone '${
            timeZone || 'UTC'
        }')::time nowtime, "startTime" as stTime,
        (CASE WHEN (((now() + interval '30 min') at time zone '${
            timeZone || 'UTC'
        }')::timestamp) > (date || ' '|| "startTime")::timestamp
        THEN (((now() + interval '30 min') at time zone '${timeZone || 'UTC'}')::time)
        ELSE shift_timings."startTime" END) as "startTime",
        current_day,
        shift_timings.timings_day as day,
        date,
        to_char(date, 'FMDay, Mon, FMDD') as formatted_date,
        to_char(date, 'FMDay') as "startDay",        
        to_char((
           case when "endDate" = '1970-01-01' then date else (date + interval '1 day') end), 'FMDay') as "endDay"
        from one_week_from_now
        inner join shift_timings ON shift_timings.timings_day = one_week_from_now.day
        WHERE (current_day = TRUE and (((now() + interval '1 hour 30 minutes') at time zone '${
            timeZone || 'UTC'
        }')::timestamp) <= (
            case when "nextDay" = true then
            ((date + interval '1 day')::date || ' '|| shift_timings."endTime")::timestamp
            else  ((date) || ' '|| shift_timings."endTime")::timestamp end
        ) 
               OR (current_day = FALSE))
        order by date, "startTime"
        LIMIT 1
) as sub`;
    const timings = await Timings.query(transaction).knex().raw(query);
    return timings.rows[0];
}

async function getOnDemandWindow(stores, timeZone, transaction) {
    const query = `
    select to_char(sub."startTime", 'FMHH12:MI am') as "startTime",
    to_char(sub."startTime" + interval '30 minutes', 'FMHH12:MI am') as "endTime",
    extract( epoch from
            (sub.date|| ' '|| sub."startTime")::timestamp
        ) as "startEpochTime",
     extract( epoch from
            (sub.date|| ' '|| sub."startTime")::timestamp + interval '30 minutes') as "endEpochTime",
     sub.day,
     sub.formatted_date as date,
     sub."startDay",
     sub."endDay", 
     "timingId"
    from
    ( with shift_timings AS(
        select (timings."startTime")::time as "startTime",
           (timings."endTime")::time as "endTime", timings."endTime"::date as "endDate",
            "timings"."day"::int as timings_day, timings.id as "timingId", 
           case when timings."endTime"::date = '1970-01-02'  then true else false end as "nextDay",
           "shifts".name as shift_name, "shifts"."storeId" as "storeId" from "timings" 
           inner join "shifts" on "shifts"."id" = "timings"."shiftId" 
           and "shifts"."type" = 'CENTS_DELIVERY' where "shifts"."storeId" in (${stores})
           and "timings"."isActive" = true
       ),
         one_week_from_now AS(
            SELECT (now() at time zone '${timeZone || 'UTC'}')::date + s.a AS date, 
            EXTRACT(DOW FROM (now() at time zone '${timeZone || 'UTC'}')::date + s.a) as day,
            ((now() at time zone '${timeZone || 'UTC'}')::date = (now() at time zone '${
        timeZone || 'UTC'
    }')::date + s.a)
              as current_day FROM generate_series(0,7) AS s(a)
       )
        select "timingId",((now() + interval '30 min') at time zone '${
            timeZone || 'UTC'
        }')::time nowtime, "startTime" as stTime,
        (CASE WHEN (((now() + interval '30 min') at time zone '${
            timeZone || 'UTC'
        }')::timestamp) > (date || ' '|| "startTime")::timestamp
        THEN (((now() + interval '30 min') at time zone '${timeZone || 'UTC'}')::time)
        ELSE shift_timings."startTime" END) as "startTime",
        current_day,
        shift_timings.timings_day as day,
        date,
        to_char(date, 'FMDay, Mon, FMDD') as formatted_date,
        to_char(date, 'FMDay') as "startDay",        
        to_char((
           case when "endDate" = '1970-01-01' then date else (date + interval '1 day') end), 'FMDay') as "endDay"
        from one_week_from_now
        inner join shift_timings ON shift_timings.timings_day = one_week_from_now.day
        WHERE (current_day = TRUE and (((now() + interval '1 hour') at time zone '${
            timeZone || 'UTC'
        }')::timestamp) <= (
            case when "nextDay" = true then
            ((date + interval '1 day')::date || ' '|| shift_timings."endTime")::timestamp
            else  ((date) || ' '|| shift_timings."endTime")::timestamp end
        ) 
               OR (current_day = FALSE))
        order by date, "startTime"
        LIMIT 1
) as sub`;
    const timings = await Timings.query(transaction).knex().raw(query);
    return timings.rows[0];
}

async function getDeliveryWindowsWithEpochDate({
    storeId,
    type,
    timeZone,
    zoneId,
    validate = false,
    bufferInHours = 0.5,
    deliveryType,
}) {
    const deliveryOptions = {
        storeId,
        type,
        timeZone: timeZone || 'UTC',
        zoneId: type === shiftType.OWN_DELIVERY && zoneId ? zoneId : null,
        bufferInHours,
    };

    const deliveryTimingsQueryObject = new CustomQuery('delivery-timings.sql', deliveryOptions);
    const timings = await deliveryTimingsQueryObject.execute();

    return validate ? mapTimingsAccordingToDays(timings, deliveryType) : mapTimings(timings);
}

module.exports = exports = {
    getOwnDeliveryWindow,
    getOnDemandWindow,
    getDeliveryWindowsWithEpochDate,
};

SELECT
  timings.id,
  timings.day,
  timings."startTime",
  timings."endTime",
  extract (epoch from concat(
      '1970-01-01',
      ' ',
      ((timings."startTime"))::time,
      ' ',
      '{{{timeZone}}}')::timestamp at time zone '{{{timeZone}}}')
  AS "startEpochTime",
  extract (DOW from now() at time zone '{{{timeZone}}}') AS "currentDay",
  extract (DAY from now() at time zone '{{{timeZone}}}') AS "currentDayOfMonth",
  extract (epoch from concat(
      '1970-01-01',
      ' ',
      ((now() + interval '{{bufferInHours}} hours') at time zone '{{{timeZone}}}')::time)::timestamp at time zone '{{{timeZone}}}')
  AS "currentEpochTime"
FROM timings
  INNER JOIN shifts ON shifts.id = timings."shiftId"
  {{#zoneId}}
  INNER JOIN "shiftTimingZones"
    ON "shiftTimingZones"."timingId" = timings.id
    AND '{{zoneId}}' = ANY("shiftTimingZones"."zoneIds")
  {{/zoneId}}
WHERE shifts."storeId" = {{storeId}}
  AND shifts.type = '{{type}}'
  AND timings."isActive" = true
ORDER BY timings.day, timings."startTime"
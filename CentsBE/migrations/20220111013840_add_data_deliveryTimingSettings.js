exports.up = async function (knex) {
  const query = `
        INSERT INTO "deliveryTimingSettings" ("timingsId")
        SELECT
            timings.id AS "timingsId"
        FROM timings
        INNER JOIN shifts
            ON shifts.id = timings."shiftId"
            AND shifts."type" = 'OWN_DELIVERY'
        GROUP BY timings.id
    `;

  return knex.raw(query);
};

exports.down = function (knex) {
  return knex('deliveryTimingSettings').del();
};

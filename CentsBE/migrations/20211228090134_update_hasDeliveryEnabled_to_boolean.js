exports.up = function (knex) {
    const query = `
    ALTER TABLE "stores" ALTER "hasDeliveryEnabled" DROP DEFAULT;
    ALTER TABLE "stores" ALTER "hasDeliveryEnabled" TYPE bool USING
      CASE
        WHEN "hasDeliveryEnabled" = 'true' THEN TRUE
        ELSE FALSE
    END;
  `;

    return knex.raw(query);
};

exports.down = function (knex) {
    const query = `
    ALTER TABLE "stores" ALTER "hasDeliveryEnabled" DROP DEFAULT;
    ALTER TABLE "stores" ALTER "hasDeliveryEnabled" TYPE VARCHAR (255) USING
      CASE
        WHEN "hasDeliveryEnabled" = TRUE THEN 'true'
        ELSE 'false'
    END;
  `;

    return knex.raw(query);
};

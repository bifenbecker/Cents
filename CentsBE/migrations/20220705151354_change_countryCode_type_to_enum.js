exports.up = (knex) => {
    const query = `
        UPDATE "orderDeliveries"
        SET "countryCode" = 'US'
        WHERE "countryCode" = 'USA';

        UPDATE "centsCustomerAddresses"
        SET "countryCode" = 'US'
        WHERE "countryCode" = 'USA';

        CREATE TYPE country_code as ENUM('US');

        ALTER TABLE "orderDeliveries" ALTER COLUMN "countryCode" TYPE country_code using "countryCode"::country_code;
        ALTER TABLE "centsCustomerAddresses" ALTER COLUMN "countryCode" TYPE country_code using "countryCode"::country_code;
        ALTER TABLE "orderDeliveries" ALTER COLUMN "countryCode" SET DEFAULT 'US';
        ALTER TABLE "centsCustomerAddresses" ALTER COLUMN "countryCode" SET DEFAULT 'US';
    `
    return knex.raw(query);
};

exports.down = (knex) => {
    const query = `
        ALTER TABLE "orderDeliveries" ALTER COLUMN "countryCode" TYPE VARCHAR(255);
        ALTER TABLE "centsCustomerAddresses" ALTER COLUMN "countryCode" TYPE VARCHAR(255);
        DROP TYPE country_code;
    `
    return knex.raw(query);
};
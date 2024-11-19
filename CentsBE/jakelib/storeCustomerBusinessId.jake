const { task, desc } = require('jake');

const StoreCustomers = require('../models/storeCustomer');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc(
    'Update businessId for store customers where there is a mismatch between storeId and businessId',
);

task('update_businessId_for_store_customers', async () => {
    try {
        const updateQuery = `
        update "storeCustomers" set "businessId" = t."businessId"
        from (
            select "storeCustomers".id, stores."businessId" from "storeCustomers"
            join stores on stores.id = "storeCustomers"."storeId"
            where stores."businessId" <>  "storeCustomers"."businessId"
        ) as t(id, "businessId")
        where "storeCustomers".id = t.id;
        `;
        await StoreCustomers.query().knex().raw(updateQuery);
    } catch (error) {
        LoggerHandler('error', `Error occured while updating businessId for customers:\n\n${error}`);
    }
});

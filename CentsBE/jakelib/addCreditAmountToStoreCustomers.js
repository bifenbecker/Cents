const { task, desc } = require('jake');
const Model = require('../models');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Adding credit information to store customers table.');

task('add_credit_amount_to_store_customer', async () => {
    try {
        const query = `
        update "storeCustomers" set "creditAmount" = t."creditAmount"
        from (
            select sum(amount) as "creditAmount", "customerId", "businessId" from "creditHistory"
            group by "customerId", "businessId"
        ) t
        where "storeCustomers"."centsCustomerId" = t."customerId" and  "storeCustomers"."businessId" = t."businessId";`;

        await Model.query().knex().raw(query);
    } catch (error) {
        LoggerHandler('error', error);
    }
});

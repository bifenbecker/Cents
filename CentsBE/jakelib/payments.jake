const Payment = require('../models/payment');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc(`Map orderId in payments table to point to id in orders table. 
Earlier orderId column was pointing to id in serviceOrders table.`);

task('payments_data_migration', async () => {
    try {
        const updateQuery = `
        update payments set 
        "orderId" = t."orderId"
        from ( select "serviceOrders".id as "serviceOrderId", orders.id as "orderId" from orders
		   join "serviceOrders" on "serviceOrders".id = "orders"."orderableId"
            and "orders"."orderableType" in ('serviceOrder', 'ServiceOrder')
        ) as  t("serviceOrderId", "orderId")
        where payments."serviceOrderId" = t."serviceOrderId";
        `;
        await Payment.query().knex().raw(updateQuery);
    } catch (error) {
        LoggerHandler('error', `Error occured while mapping orderId:\n\n${error}`);
    }
});

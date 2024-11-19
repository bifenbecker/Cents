const { task, desc } = require('jake');
const { transaction } = require('objection');

const Payment = require('../models/payment');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Populate storeCustomerId in payments table.');

task('payments_store_customerId', async () => {
    let trx = null;
    try {
        const serviceOrderQuery = `
        update payments set
        "storeCustomerId" = t."storeCustomerId"
        from( select "serviceOrders"."storeCustomerId" as "storeCustomerId", orders.id as "orderId" from orders 
        join "serviceOrders" on "serviceOrders".id = orders."orderableId"
        and orders."orderableType" in ('serviceOrder', 'ServiceOrder'))
        as t("storeCustomerId", "orderId")
        where payments."orderId" = t."orderId";`;
        const inventoryOrderQuery = `
        update payments set
        "storeCustomerId" = t."storeCustomerId"
        from(select "inventoryOrders"."storeCustomerId" as "storeCustomerId", orders.id as "orderId" from orders
        join "inventoryOrders" on "inventoryOrders".id = orders."orderableId" 
        and orders."orderableType" = 'InventoryOrder')
        as t("storeCustomerId", "orderId")
        where payments."orderId" = t."orderId";
        `;
        trx = await transaction.start(Payment.knex());
        await Payment.query(trx).knex().raw(serviceOrderQuery);
        await Payment.query(trx).knex().raw(inventoryOrderQuery);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler(
            'error',
            `error occured while populating storeCustomerId in payments table:\n\n${error}`,
        );
    }
});

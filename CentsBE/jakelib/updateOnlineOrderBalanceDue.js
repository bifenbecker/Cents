const { task, desc } = require('jake');
const JakeTasksLog = require('../models/jakeTasksLog');
const Model = require('../models');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Updating balance due and paymentTiming for online orders');

task('update_balanceDue_and_payment_timing_of_online_orders', async () => {
    try {
        const updateQuery = `
            update "serviceOrders" set 
            "paymentTiming" = 'POST-PAY',
            "balanceDue" = "netOrderTotal" - (coalesce(paid, 0)-coalesce(refunded, 0)),
            "paymentStatus" = 'PENDING'
            FROM(
            select "serviceOrders".id, sum(payments."totalAmount") FILTER (where payments.status = 'succeeded') as paid, sum(payments."totalAmount") FILTER (where payments.status = 'refunded') as refunded from "serviceOrders" 
            inner join "orders" ON orders."orderableId" = "serviceOrders".id and orders."orderableType" = 'ServiceOrder'
            inner join payments on payments."orderId" = "orders".id
            where "serviceOrders"."orderType"='ONLINE' and "serviceOrders".status not in ('COMPLETED', 'CANCELLED')
            group by "serviceOrders".id) as sub
            where "serviceOrders".id = sub.id
        `;
        await Model.query().knex().raw(updateQuery);
        await JakeTasksLog.query().insert({
            taskName: 'update_balanceDue_and_payment_timing_of_online_orders',
        });
    } catch (error) {
        LoggerHandler('error', error);
    }
});

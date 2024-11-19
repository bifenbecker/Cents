const { transaction } = require('objection');
const { task, desc } = require('jake');
const Model = require('../models');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('update  balanceDue for unpaid orders');

task('update_balance_due', async () => {
    let trx = null;
    try {
        const paymentStatusQuery = `update "serviceOrders" set "paymentStatus" = 'PAID'
        from(
        select "serviceOrders".id from "serviceOrders"
        inner join orders ON orders."orderableId" = "serviceOrders".id AND orders."orderableType" = 'ServiceOrder'
        inner join payments ON payments."orderId" = orders.id and payments.status = 'succeeded'
        where "serviceOrders".status = 'COMPLETED' and "paymentStatus" != 'PAID'
        ) as sub
        where "serviceOrders".id = sub.id`;
        const balanceDueQuery = `update "serviceOrders"
            set "balanceDue" = "serviceOrders"."netOrderTotal"
            where "paymentStatus" <> 'PAID'`;
        trx = await transaction.start(Model.knex());
        await Model.query().knex().raw(paymentStatusQuery);
        await Model.query().knex().raw(balanceDueQuery);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});

const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Order = require('../models/serviceOrders');
const BusinessOrderCount = require('../models/businessOrderCount');

desc('Add data to business orders count table.');

task('addBusinessOrderCount', async () => {
    let trx;
    try {
        const data = await Order.query()
            .select('laundromatBusiness.id as businessId')
            .count({
                totalOrders: 'serviceOrders.id',
            })
            .rightJoin('stores', 'stores.id', 'serviceOrders.storeId')
            .rightJoin('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .groupBy(1);
        const trx = await transaction.start(BusinessOrderCount.knex());
        await BusinessOrderCount.query(trx).insert(data);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', `error occured while adding data to business orders count table:\n\n${error}`);
    }
});

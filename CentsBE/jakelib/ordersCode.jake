const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const ServiceOrder = require('../models/serviceOrders');
const LaundromatBusiness = require('../models/laundromatBusiness');

desc('Populate order code column in service orders table.');

async function addData(businessId, trx) {
    const orders = await ServiceOrder.query(trx)
        .select('serviceOrders.id', 'serviceOrders.orderCode')
        .join('stores', 'stores.id', 'serviceOrders.storeId')
        .where('stores.businessId', businessId)
        .orderBy('serviceOrders.id', 'asc');
    // fixed offset value for each business.
    let j = 1000;
    const records = [];
    for (const i of orders) {
        j += 1;
        if (i.orderCode) {
            continue;
        }
        i.orderCode = j;
        records.push(i);
    }
    const patchArray = records.map((order) =>
        ServiceOrder.query(trx)
            .patch({
                orderCode: order.orderCode,
            })
            .findById(order.id),
    );
    await Promise.all(patchArray);
}

task('addOrderCode', async () => {
    let trx;
    try {
        const business = await LaundromatBusiness.query().select('id');
        trx = await transaction.start(ServiceOrder.knex());
        const temp = business.map((a) => addData(a.id, trx));
        await Promise.all(temp);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', `error occurred while populating order code column in service orders table:\n\n${error}`)
    }
});

const { task, desc } = require('jake');
const { transaction } = require('objection');

const ServiceReferenceItem = require('../models/serviceReferenceItem');
const OrderItem = require('../models/serviceOrderItem');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function addTotalPriceToReferenceItem(serviceReferenceItem) {
    const orderItem = await OrderItem.query().findById(serviceReferenceItem.orderItemId);
    const totalPrice = orderItem.price;

    await ServiceReferenceItem.query()
        .findById(serviceReferenceItem.id)
        .patch({
            totalPrice,
        })
        .returning('*');
}

desc('Set totalPrice for each ServiceReferenceItem');
task('totalPrice_for_serviceReferenceItems', async () => {
    let trx = null;
    try {
        const serviceReferenceItems = await ServiceReferenceItem.query();

        trx = await transaction.start(ServiceReferenceItem.knex());

        const referenceItemResult = serviceReferenceItems.map((item) =>
            addTotalPriceToReferenceItem(item, trx),
        );

        await Promise.all(referenceItemResult);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});

const { task, desc } = require('jake');
const { transaction, raw } = require('objection');

const ServiceOrders = require('../models/serviceOrders');
const ServiceOrderBags = require('../models/serviceOrderBags');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function getBags() {
    const mappedData = await ServiceOrders.query()
        .select(
            'serviceOrders.id as serviceOrderId',
            'itemWeights.status as barcodeStatus',
            raw('coalesce("itemWeights"."bagCount", 1) as "bagCount"'),
        )
        .join('serviceOrderItems', 'serviceOrderItems.orderId', 'serviceOrders.id')
        .join('itemWeights', 'itemWeights.orderItemId', 'serviceOrderItems.id')
        .where('itemWeights.step', 1);
    return mappedData;
}

function mapRecords(bags) {
    const response = [];
    for (const bag of bags) {
        const { bagCount, serviceOrderId, barcodeStatus } = bag;
        if (bagCount === 0) {
            response.push({
                serviceOrderId,
                barcodeStatus,
            });
        } else {
            for (let i = 0; i < bagCount; i++) {
                response.push({
                    serviceOrderId,
                    barcodeStatus,
                });
            }
        }
    }
    return response;
}
async function addData(trx, data) {
    await ServiceOrderBags.query(trx).insert(data);
}

desc('Add missing data to serviceOrderBags table');
task('bagsDataMigration', async () => {
    let trx = null;
    try {
        const itemBags = await getBags();
        const insertData = mapRecords(itemBags);
        trx = await transaction.start(ServiceOrderBags.knex());
        await addData(trx, insertData);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler(
            'error',
            'Error occurred while adding missing data to serviceOrderBags table',
        );

        LoggerHandler('error', error);
    }
});

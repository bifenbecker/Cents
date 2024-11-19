const { map } = require('lodash');

const OrderDelivery = require('../../models/orderDelivery');
const ServiceOrderQuery = require('../../services/queries/serviceOrder');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const { orderDeliveryStatuses } = require('../../constants/constants');

async function completeActiveDeliveries(job, done) {
    try {
        const { id } = job.data;
        const serviceOrderQuery = new ServiceOrderQuery(id);
        const activeDeliveries = await serviceOrderQuery.activeDeliveries();
        await OrderDelivery.query()
            .patch({
                status: orderDeliveryStatuses.COMPLETED,
            })
            .whereIn('id', map(activeDeliveries, 'id'));
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error in completeActivieDeliveries.',
            job,
        });
        done(error);
    }
}
module.exports = exports = completeActiveDeliveries;

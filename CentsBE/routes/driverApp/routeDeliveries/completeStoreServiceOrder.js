const eventEmitter = require('../../../config/eventEmitter');
const { statuses } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const ServiceOrder = require('../../../models/serviceOrders');
const completeStoreServiceOrderPipeline = require('../../../pipeline/driverApp/completeStoreServiceOrderPipeline');

module.exports = async function completeStoreServiceOrder(req, res, next) {
    try {
        const { routeDeliveryId, serviceOrderId } = req.params;
        const { decodedToken } = req.locals;
        const payload = {
            routeDeliveryId,
            serviceOrderId,
            ...req.body,
            driverId: decodedToken.teamMemberId,
        };
        const result = await completeStoreServiceOrderPipeline(payload);
        const serviceOrder = await ServiceOrder.query().findById(serviceOrderId);
        if (statuses.COMPLETED === serviceOrder.status) {
            eventEmitter.emit('indexCustomer', serviceOrder.storeCustomerId);
        }
        res.json({
            success: true,
            result,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        next(error);
    }
};

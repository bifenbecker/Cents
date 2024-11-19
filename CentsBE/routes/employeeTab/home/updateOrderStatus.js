const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const updateOrderStatusPipelineModule = require('../../../pipeline/employeeApp/serviceOrder/updateOrderStatusPipeline');
const ServiceOrder = require('../../../models/serviceOrders');
const { origins, statuses } = require('../../../constants/constants');
const StripeErrorHandler = require('../../../uow/delivery/dropoff/StripeErrorHandler');
const ServiceOrderQuery = require('../../../services/queries/serviceOrder');
const eventEmitter = require('../../../config/eventEmitter');

// async function updateCount(serviceReferenceItemId, bagCount, transaction) {
//     // one reference item for one orderItem.
//     await ServiceReferenceItem.query(transaction).patch({
//         quantity: bagCount,
//     }).findById(serviceReferenceItemId);
// }

async function updateStatus(req, res, next) {
    let serviceOrderId;
    let masterOrderId;
    const { status } = req.body;
    try {
        const orderBeforeUpdate = await ServiceOrder.query()
            .findById(req.body.id)
            .withGraphJoined('[order.[delivery], store.[settings], storeCustomer.[centsCustomer]]');
        serviceOrderId = req.body.id;
        masterOrderId = orderBeforeUpdate.order.id;
        const payload = {
            ...req.body,
            currentStore: req.currentStore,
            ...req.constants,
            ...req,
            orderBeforeUpdate,
            masterOrderId,
            serviceOrderId,
            origin: origins.EMPLOYEE_APP,
        };
        await updateOrderStatusPipelineModule.updateOrderStatusPipeline(payload);
        const orderDetails = await getSingleOrderLogic(req.body.id, req.currentStore);
        eventEmitter.emit('indexCustomer', orderDetails.customer.storeCustomerId);

        res.status(200).json({
            success: true,
            orderItems: orderDetails.orderItems || [],
            activityLog: orderDetails.activityLog || [],
            status: orderDetails.status,
            orderDetails,
        });
    } catch (error) {
        // we are capturig the pending payment when completing the order for in-store pickups.
        // if there is a stripe error, the payment status will not get updated.
        // so to update the payment status when the payment capturing fails, we have added the below code
        if (status === statuses.COMPLETED) {
            const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId);
            const pendingPayment = await serviceOrderQuery.pendingPayment();
            if (pendingPayment) {
                const handleStripeErrors = new StripeErrorHandler(error, pendingPayment.id);
                if (handleStripeErrors.isStripeError()) {
                    await handleStripeErrors.updatePaymentErrorStatus();
                }
            }
        }
        next(error);
    }
}

module.exports = exports = {
    updateStatus,
};

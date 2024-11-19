const ServiceOrder = require('../models/serviceOrders');
const { getServiceOrderAndCustomerDetails } = require('../utils/addOrderCustomerAndEmployee');
const ServiceOrderQuery = require('../services/queries/serviceOrder');

async function setOrderCalculationsDetails(req, res, next) {
    try {
        let { id } = req.params;
        req.constants = req.constants || {};
        if (!id && req.constants.order) {
            // this condition is for live-link
            id = req.constants.order.id;
        }
        const serviceOrderQuery = new ServiceOrderQuery(id);
        const successfulPayment = await serviceOrderQuery.hasSuccessfulPayment();
        const serviceOrder = await ServiceOrder.query().findById(id).withGraphJoined('order');
        if (serviceOrder.paymentStatus === 'PAID' && successfulPayment) {
            res.status(409).json({
                error: 'You cannot update an order that has already been paid for.',
            });
            return;
        }
        const orderId = serviceOrder.order.id;

        const orderCalculationAttributes = {
            promotionId: serviceOrder.promotionId,
            tipAmount: serviceOrder.tipAmount,
            pickupDeliveryFee: serviceOrder.pickupDeliveryFee,
            pickupDeliveryTip: serviceOrder.pickupDeliveryTip,
            returnDeliveryFee: serviceOrder.returnDeliveryFee,
            returnDeliveryTip: serviceOrder.returnDeliveryTip,
            creditAmount: serviceOrder.creditAmount,
            convenienceFee: serviceOrder.convenienceFee,
        };
        const currentOrderDetails = await getServiceOrderAndCustomerDetails(orderId);

        req.constants.orderCalculationAttributes = orderCalculationAttributes;
        req.constants.orderCalculationAttributes.convenienceFeeId = serviceOrder.convenienceFeeId;

        req.constants.currentOrderDetails = currentOrderDetails;
        req.constants.serviceOrder = serviceOrder;
        req.constants.orderId = serviceOrder.order.id;

        next();
    } catch (error) {
        next(error);
    }
}
module.exports = exports = setOrderCalculationsDetails;

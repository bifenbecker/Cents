const Joi = require('@hapi/joi');

const ServiceOrder = require('../../../models/serviceOrders');
const Order = require('../../../models/orders');
const OrderDelivery = require('../../../models/orderDelivery');

const { statuses, hubStatues } = require('../../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        status: Joi.string().required(),
        serviceOrderId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Determine the order's payment status based on order type and payment history
 *
 * @param {Object} serviceOrder
 */
async function determineOrderPaymentStatus(serviceOrder) {
    const order = await Order.query().withGraphFetched('payments').findOne({
        orderableType: 'ServiceOrder',
        orderableId: serviceOrder.id,
    });
    const { payments } = order;

    if (payments.length === 0) {
        return false;
    }

    const successfulPayments = payments.filter((payment) => payment.status === 'succeeded');
    const successfulPaymentTotalsArray = successfulPayments.map((payment) => payment.totalAmount);
    const totalPaid = successfulPaymentTotalsArray.reduce(
        (previous, currentItem) => previous + currentItem,
        0,
    );

    if (totalPaid > 0 && totalPaid >= serviceOrder.netOrderTotal) {
        return true;
    }

    return false;
}

/**
 * Find any deliveries that are in progress to determine whether
 * the order can safely be canceled
 *
 * In progress here can be defined as any deliveries where status is NOT:
 *
 * 1) COMPLETED
 * 2) CANCELED
 * 3) SCHEDULED
 * 4) INTENT_CREATED
 *
 * @param {Number} orderId
 */
async function findInProgressDeliveries(orderId) {
    const statuses = ['COMPLETED', 'CANCELED', 'SCHEDULED', 'INTENT_CREATED'];
    const deliveries = await OrderDelivery.query()
        .where({
            orderId,
        })
        .andWhere((builder) => builder.whereNotIn('status', statuses));
    return deliveries;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { status, serviceOrderId } = req.body;

        if (
            !Object.values(statuses).includes(status) &&
            !Object.values(hubStatues).includes(status)
        ) {
            res.status(422).json({
                error: 'The status you have selected is not a valid status.',
            });
            return;
        }

        const serviceOrder = await ServiceOrder.query()
            .withGraphFetched('order')
            .findById(serviceOrderId);
        const isPaid = await determineOrderPaymentStatus(serviceOrder);

        if (!isPaid && status === 'COMPLETED') {
            res.status(422).json({
                error: 'You cannot mark an unpaid order as complete. Please void the order instead.',
            });
            return;
        }

        if (isPaid && status === 'CANCELLED') {
            res.status(422).json({
                error: 'You cannot cancel or mark an order as void if the order has been paid for. Please mark it as complete.',
            });
            return;
        }

        const inProgressDeliveries = await findInProgressDeliveries(serviceOrder.order.id);

        if (status === 'CANCELLED' && inProgressDeliveries.length >= 1) {
            res.status(422).json({
                error: 'You cannot cancel this order because it has a delivery that is currently in progress.',
            });
            return;
        }

        req.constants = req.constants || {};
        req.constants.inProgressDeliveries = inProgressDeliveries;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

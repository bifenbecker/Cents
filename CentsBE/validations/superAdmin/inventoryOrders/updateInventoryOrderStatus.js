const Joi = require('@hapi/joi');

const InventoryOrder = require('../../../models/inventoryOrders');
const Order = require('../../../models/orders');

const { inventoryOrderStatuses } = require('../../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        status: Joi.string().required(),
        inventoryOrderId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Determine the order's payment status based on order type and payment history
 *
 * @param {Object} inventoryOrder
 */
async function determineOrderPaymentStatus(inventoryOrder) {
    const order = await Order.query().withGraphFetched('payments').findOne({
        orderableType: 'InventoryOrder',
        orderableId: inventoryOrder.id,
    });
    const { payments } = order;

    if (payments.length === 0) {
        return true;
    }

    const successfulPayments = payments.filter((payment) => payment.status === 'succeeded');
    const successfulPaymentTotalsArray = successfulPayments.map((payment) => payment.totalAmount);
    const totalPaid = successfulPaymentTotalsArray.reduce(
        (previous, currentItem) => previous + currentItem,
        0,
    );

    if (totalPaid >= inventoryOrder.netOrderTotal) {
        return false;
    }

    return true;
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

        const { status, inventoryOrderId } = req.body;

        if (!Object.values(inventoryOrderStatuses).includes(status)) {
            res.status(422).json({
                error: 'The status you have selected is not a valid status.',
            });
            return;
        }

        const inventoryOrder = await InventoryOrder.query().findById(inventoryOrderId);

        if (inventoryOrder.paymentStatus === 'BALANCE_DUE' && status === 'COMPLETED') {
            res.status(422).json({
                error: 'You cannot mark an unpaid order as complete. Please void the order instead.',
            });
            return;
        }

        const eligibleToCancel = await determineOrderPaymentStatus(inventoryOrder);
        if (
            (!eligibleToCancel || inventoryOrder.paymentStatus === 'PAID') &&
            status === 'CANCELLED'
        ) {
            res.status(422).json({
                error: 'You cannot cancel or mark an order as void if the order has been paid for. Please mark it as complete.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

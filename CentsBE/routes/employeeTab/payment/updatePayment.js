const { transaction } = require('objection');

const Payment = require('../../../models/payment');
const ServiceOrder = require('../../../models/serviceOrders');
const Store = require('../../../models/store');
const Order = require('../../../models/orders');
const InventoryOrder = require('../../../models/inventoryOrders');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

function updatePaymentObject(obj) {
    return {
        status: obj.status,
        totalAmount: obj.amount / 100,
    };
}

/**
 * Determine the proper order status
 *
 * @param {String} orderableType
 * @param {Object} orderable
 * @param {Object} store
 */
async function determineOrderStatus(orderableType, orderable, store) {
    if (orderableType === 'InventoryOrder') return 'COMPLETED';

    const status = store.isIntakeOnly ? 'DESIGNATED_FOR_PROCESSING_AT_HUB' : 'READY_FOR_PROCESSING';
    const orderStatus = orderable.status === 'PAYMENT_REQUIRED' ? status : orderable.status;

    return orderStatus;
}

/**
 * Based on the given orderableType, update the order sub-class
 *
 * @param {Object} orderable
 * @param {Number} amount
 * @param {String} orderableType
 * @param {String} paymentStatus
 * @param {String} orderStatus
 * @param {Number} orderableId
 * @param {void} trx
 */
async function updateOrder(
    orderable,
    amount,
    orderableType,
    paymentStatus,
    orderStatus,
    orderableId,
    trx,
) {
    const model = orderableType === 'ServiceOrder' ? ServiceOrder : InventoryOrder;
    const balanceDue =
        paymentStatus === 'PAID' ? orderable.balanceDue - amount : orderable.balanceDue;

    const updatedModel = await model
        .query(trx)
        .patch({
            paymentStatus,
            status: orderStatus,
            balanceDue,
        })
        .findById(orderableId)
        .returning('*');

    return updatedModel;
}

const updatePayment = async (req, res, next) => {
    let trx = null;
    try {
        trx = await transaction.start(Payment.knex());

        const request = req.body === undefined ? updatePaymentObject(req) : req.body;

        const payment = await Payment.query(trx)
            .patch(request)
            .where('paymentToken', req.id)
            .returning('*');

        const order = await Order.query(trx).findById(payment[0].orderId);
        const orderable = await order.getOrderable();
        const { orderableId } = order;
        const { orderableType } = order;

        const store = await Store.query(trx).findById(payment[0].storeId);
        const orderStatus = await determineOrderStatus(orderableType, orderable, store);

        await updateOrder(
            orderable[0],
            request.totalAmount,
            orderableType,
            'PAID',
            orderStatus,
            orderableId,
            trx,
        );

        await trx.commit();

        if (res !== undefined) {
            return res.status(200).json({
                success: true,
                payment,
            });
        }

        return payment;
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error, req);
        return next(error);
    }
};

module.exports = exports = updatePayment;

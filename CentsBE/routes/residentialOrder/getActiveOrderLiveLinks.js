// Packages
const jwt = require('jsonwebtoken');

// Models
const ServiceOrder = require('../../models/serviceOrders');

// Utils
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');

/**
 * Generate the proper live link URL
 *
 * @param {Number} serviceOrderId
 */
async function generateLiveLink(serviceOrderId) {
    const token = await jwt.sign({ id: serviceOrderId }, process.env.JWT_SECRET_TOKEN_ORDER);
    const liveLink = process.env.LIVE_LINK;
    const liveLinkUrl = liveLink + token;

    return liveLinkUrl;
}

/**
 * Format and return only required fields for a ServiceOrder
 *
 * @param {Object} order
 */
async function mapServiceOrderResponse(order) {
    const liveLink = await generateLiveLink(order.id);
    const orderCodeWithPrefix = getOrderCodePrefix(order);

    const response = {
        id: order.id,
        status: order.status,
        orderTotal: order.orderTotal,
        placedAt: order.placedAt,
        paymentStatus: order.paymentStatus,
        orderCode: orderCodeWithPrefix,
        netOrderTotal: order.netOrderTotal,
        balanceDue: order.balanceDue,
        liveLinkUrl: liveLink,
        customerName: `${order.storeCustomer.firstName} ${order.storeCustomer.lastName}`,
        customerPhone: order.storeCustomer.phoneNumber,
    };

    return response;
}

/**
 * Retrieve a list of all ServiceOrders and their live links for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getActiveOrderLiveLinks(req, res, next) {
    try {
        const { id } = req.params;
        const serviceOrders = await ServiceOrder.query()
            .withGraphFetched('storeCustomer')
            .where({
                storeId: id,
            })
            .whereNotIn('status', ['COMPLETED', 'CANCELLED']);

        let formattedOrders = serviceOrders.map((order) => mapServiceOrderResponse(order));
        formattedOrders = await Promise.all(formattedOrders);

        return res.json({
            success: true,
            orders: formattedOrders,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getActiveOrderLiveLinks;

const { origins } = require('../../../constants/constants');
const createUberDeliveryPipline = require('../../../pipeline/delivery/uber/createUberDeliveryPipeline');
const { getOrderDetails } = require('../../../services/liveLink/queries/serviceOrder');

/**
 * Create an Uber delivery for a service order.
 *
 * This API performs the following actions:
 *
 * 1) Based on the incoming request, create a Stripe Customer for the CentsCustomer.
 * 2) Based on the incoming request, store a new PaymentMethod for a CentsCustomer.
 * 3) Create a Delivery via Uber's API;
 * 4) Create an OrderDelivery model using the response from Uber;
 * 5) Add a new ServiceOrderItem for the Delivery service;
 * 6) Add a new ServiceReferenceItem based on the ServiceOrderItem for the Delivery service;
 * 7) Add the Delivery line item to the order based on the ServiceReferenceItem;
 * 8) Update the final cost and balance due of the order;
 * 9) Create a Stripe PaymentIntent for the delivery and store it on our end.
 * 10) Reset balanceDue to $0 since payment has been created
 *
 * NOTE: we will initially not be capturing payment during delivery scheduling.
 *       Payment will only be captured once the delivery is complete, as we will have
 *       the proper final cost of delivery only when delivey is completed.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createUberDelivery(req, res, next) {
    try {
        const output = await createUberDeliveryPipline({ ...req.body, origin: origins.LIVE_LINK });
        const order = await getOrderDetails(output.serviceOrder.id);

        return res.status(200).json({
            success: true,
            output,
            order,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = createUberDelivery;

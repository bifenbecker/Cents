const OrderDelivery = require('../../../models/orderDelivery');

const getUberAuthToken = require('../../../uow/delivery/dropoff/getUberAuthTokenUow');
const getUberDeliveryDetails = require('../../../uow/delivery/dropoff/getUberDeliveryUow');

/**
 * Authenticate with Uber's API and get the Uber delivery information.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getUberDelivery(req, res, next) {
    try {
        const { orderDeliveryId } = req.params;
        let payload = {};

        const orderDelivery = await OrderDelivery.query().findById(orderDeliveryId);
        const uberDeliveryId = orderDelivery.thirdPartyDeliveryId;

        const authPayload = await getUberAuthToken(payload);

        payload = authPayload;
        payload.uberDeliveryId = uberDeliveryId;

        let uberDelivery = await getUberDeliveryDetails(payload);
        uberDelivery = uberDelivery.updatedUberDelivery;

        return res.json({
            success: true,
            uberDelivery,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { getUberDelivery };

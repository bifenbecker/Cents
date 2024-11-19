const Pipeline = require('../../pipeline');

// Uows
const getCustomerPricingTier = require('../../../uow/pricingTiers/getCustomerPricingTier');
const storeDeliverySettings = require('../../../uow/store/getStoreDeliverySettings');
const calculateDeliveryFee = require('../../../uow/delivery/deliveryFee/calculateOwnDriverDeliveryFee');
const responseFormatter = require('../../../uow/delivery/deliveryFee/responseFormatter');
const pickupAndDeliveryDetails = require('../../../uow/liveLink/serviceOrders/pickupAndDeliveryDetails');

async function computeDeliveryFee(payload) {
    try {
        const deliveryFeePipeline = new Pipeline([
            storeDeliverySettings,
            getCustomerPricingTier,
            pickupAndDeliveryDetails,
            calculateDeliveryFee,
            responseFormatter,
        ]);
        const output = await deliveryFeePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = computeDeliveryFee;

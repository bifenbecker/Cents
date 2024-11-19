const { pick } = require('lodash');

const computeDeliveryFeePipeline = require('../../pipeline/delivery/estimate/computeDeliveryFee');

async function getDeliveryEstimate(req, res, next) {
    try {
        const { currentCustomer } = req;
        const payload = {
            ...pick(req.constants, ['orderId']),
            ...pick(req.query, ['storeId']),
            currentCustomer,
        };

        const result = await computeDeliveryFeePipeline(payload);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getDeliveryEstimate;

const orderCalculationsPipeline = require('../../../pipeline/employeeApp/serviceOrder/orderCalculationsPipeline');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function orderCalculations(req, res, next) {
    try {
        const status = req.currentStore.isLocationIntakeOnly()
            ? 'DESIGNATED_FOR_PROCESSING_AT_HUB'
            : 'READY_FOR_PROCESSING';
        const payload = {
            store: req.currentStore,
            ...req.body,
            status,
            ...req.constants,
            version: req.apiVersion,
        };
        payload.skipPerPoundChargeableWeightValidation = true;

        const result = await orderCalculationsPipeline(payload);
        res.status(200).json({
            result,
        });
    } catch (error) {
        LoggerHandler(
            'error',
            `Error in /orders/calculate-total API: ${JSON.stringify(error)}`,
            req,
        );
        next(error);
    }
}
module.exports = {
    orderCalculations,
};

const orderCalculationsPipeline = require('../../../../pipeline/employeeApp/serviceOrder/orderCalculationsPipeline');

async function orderCalculations(req, res, next) {
    try {
        const status = req.currentStore.isLocationIntakeOnly()
            ? 'DESIGNATED_FOR_PROCESSING_AT_HUB'
            : 'READY_FOR_PROCESSING';
        const payload = {
            store: req.currentStore,
            ...req.body,
            storeCustomerId: req.body.customer.storeCustomerId,
            customerNotes: req.body.customer.notes,
            status,
            paymentStatus: 'BALANCE_DUE',
            ...req.constants,
        };

        const result = await orderCalculationsPipeline(payload);
        res.status(200).json({
            result,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    orderCalculations,
};

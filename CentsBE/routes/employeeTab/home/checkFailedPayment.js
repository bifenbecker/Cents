const checkFailedPaymentPipeline = require('../../../pipeline/employeeApp/serviceOrder/checkFailedPaymentPipeline');

async function checkFailedPaymentHandler(req, res, next) {
    try {
        const { serviceOrderId } = req.params;
        const payload = {
            serviceOrderId,
        };
        const result = await checkFailedPaymentPipeline(payload);
        res.status(200).json({
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = checkFailedPaymentHandler;

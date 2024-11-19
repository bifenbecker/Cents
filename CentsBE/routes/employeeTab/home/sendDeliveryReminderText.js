const sendDeliveryReminderTextPipeline = require('../../../pipeline/employeeApp/serviceOrder/sendDeliveryReminderTextPipeline');

async function sendDeliveryReminderText(req, res, next) {
    try {
        const { serviceOrderId } = req.params;
        const { id: storeId } = req.currentStore;
        if (!serviceOrderId) {
            res.status(422).json({
                error: 'serviceOrderId is required.',
            });
            return;
        }
        const payload = {
            serviceOrderId,
            storeId,
        };
        const result = await sendDeliveryReminderTextPipeline(payload);
        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = sendDeliveryReminderText;

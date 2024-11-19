const addCustomerPaymentMethodPipeline = require('../../../../pipeline/customer/paymentMethod/addCustomerPaymentMethodPipeline');

async function addCardOnFile(req, res, next) {
    try {
        const payload = {
            ...req.body,
            ...{ rememberPaymentMethod: true, requireCustomerPaymentsList: false },
        };
        await addCustomerPaymentMethodPipeline(payload);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = addCardOnFile;

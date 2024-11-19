const updateCustomerPhonePipeline = require('../../../../pipeline/customer/phone/updateCustomerPhoneNumberPipeline');

/**
 * Update phone number details for a CentsCustomer and related StoreCustomer models
 *
 * This API performs the following actions:
 *
 * 1) Updates the CentsCustomer model;
 * 2) Updates all StoreCustomer models that belong to the CentsCustomer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateCustomerPhone(req, res, next) {
    try {
        const phoneDetails = await updateCustomerPhonePipeline(req.body);

        return res.status(200).json({
            success: true,
            phoneDetails,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = updateCustomerPhone;

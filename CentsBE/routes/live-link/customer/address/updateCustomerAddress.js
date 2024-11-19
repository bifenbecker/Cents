const editCustomerAddressPipeline = require('../../../../pipeline/customer/address/editCustomerAddressPipeline');

/**
 * Save customer address details to a new CentsCustomerAddress model.
 *
 * This API performs the following actions:
 *
 * 1) Finds the Google Places ID for the provided address;
 * 2) Stores the address payload and Places ID in a CentsCustomerAddress model;
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateCustomerAddress(req, res, next) {
    try {
        const addressDetails = await editCustomerAddressPipeline(req.body);

        return res.status(200).json({
            success: true,
            addressDetails,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = updateCustomerAddress;

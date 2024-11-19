const createCustomerAddressPipeline = require('../../../../pipeline/customer/address/createCustomerAddressPipeline');

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
async function createCustomerAddress(req, res, next) {
    try {
        const addressDetails = await createCustomerAddressPipeline(req.body);

        res.status(200).json({
            success: true,
            addressDetails,
        });
    } catch (error) {
        if (error.message === 'UniqueViolationError') {
            res.status(409).json({
                error: 'Duplicate address',
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = createCustomerAddress;

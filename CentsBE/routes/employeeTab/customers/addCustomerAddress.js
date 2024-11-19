const createCustomerAddressPipeline = require('../../../pipeline/customer/address/createCustomerAddressPipeline');
const getCustomerDetails = require('./getCustomerDetails');

/**
 * Edit an individual field for a customer address via pipeline
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function addCustomerAddress(req, res, next) {
    try {
        const { id } = req.params;
        const payload = {
            centsCustomerId: id,
            ...req.body,
        };

        await createCustomerAddressPipeline(payload);

        return getCustomerDetails(req, res, next);
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = addCustomerAddress;

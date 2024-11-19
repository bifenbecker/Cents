const editCustomerAddressPipeline = require('../../../pipeline/customer/address/editCustomerAddressPipeline');
const getCustomerDetails = require('./getCustomerDetails');

/**
 * Edit an individual field for a customer address via pipeline
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function editCustomerAddress(req, res, next) {
    try {
        const { id } = req.params;
        const payload = {
            centsCustomerId: id,
            customerAddressId: req.body.address.id,
            ...req.body,
        };

        await editCustomerAddressPipeline(payload);

        return getCustomerDetails(req, res, next);
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = editCustomerAddress;

const editCustomerPipeline = require('../../../pipeline/customer/editCustomerPipeline');
const getCustomerDetails = require('./getCustomerDetails');

/**
 * Edit an individual field for a customer via pipeline
 *
 * Editing should:
 *
 * 1) Update the CentCustomer
 * 2) Update same details for every StoreCustomer associated with the CentsCustomer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function editCustomer(req, res, next) {
    try {
        const { id } = req.query;
        const payload = {
            centsCustomerId: id,
            ...req.body,
        };
        await editCustomerPipeline(payload);

        return getCustomerDetails(req, res, next);
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = editCustomer;

const { getCustomers } = require('../../../services/queries/customerQueries');
const { mapResponse } = require('./search');

async function getCustomerDetails(req, res, next) {
    try {
        const { businessId } = req.currentStore;
        const { id } = req.params;
        const customer = await getCustomers(req.currentStore.id, businessId, id, null);

        res.status(200).json({
            success: true,
            details: mapResponse(customer),
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getCustomerDetails;

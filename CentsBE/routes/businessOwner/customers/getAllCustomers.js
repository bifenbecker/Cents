const CustomerSearchService = require('../../../services/search/service/customerSearchService');

function mapResponse(input) {
    const response = {};
    response.id = input.centsCustomerId;
    response.email = input.email;
    response.boFullName = input.fullName;
    response.boEmail = input.email;
    response.boPhoneNumber = input.phoneNumber;
    return response;
}

async function getCustomers(req, res, next) {
    try {
        req.query.storeIds = req.query.stores;
        const customerSearch = new CustomerSearchService(req.query);
        const { data, totalCount } = await customerSearch.storeCustomersList();
        res.status(200).json({
            success: true,
            detail: data.map((customer) => mapResponse(customer)),
            totalCount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { getCustomers, mapResponse };

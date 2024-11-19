const { formatElasticSearchRes } = require('./search');
const CustomerSearchService = require('../../../services/search/service/customerSearchService');

async function storeCustomersList(req, res, next) {
    try {
        const { id } = req.currentStore;
        const queryParams = {
            ...req.query,
            storeIds: [id],
        };
        const customerSearch = new CustomerSearchService(queryParams);
        const { data, totalCount } = await customerSearch.storeCustomersList();

        res.status(200).json({
            success: true,
            totalCount,
            details: data.map((ele) => formatElasticSearchRes(ele, id)),
        });
    } catch (error) {
        next(error);
    }
}

async function businessCustomersList(req, res, next) {
    try {
        const { id, businessId } = req.currentStore;
        const queryParams = {
            ...req.query,
            businessId,
            currentStoreId: id,
        };
        const customerSearch = new CustomerSearchService(queryParams);
        const { data, totalCount } = await customerSearch.businessCustomersList();

        res.status(200).json({
            success: true,
            totalCount,
            details: data.map((ele) => formatElasticSearchRes(ele, id)),
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    storeCustomersList,
    businessCustomersList,
};

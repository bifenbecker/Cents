const BaseSearchService = require('./baseSearchService');
const CustomerSearchProvider = require('../elasticSearch/customerSearchProvider');

class CustomerSearchService extends BaseSearchService {
    constructor(queryParams) {
        super();
        this.queryParams = queryParams;
        this.provider = new CustomerSearchProvider(queryParams);
    }

    async storeCustomersList() {
        return this.provider.storeCustomersList();
    }

    async businessCustomersList() {
        return this.provider.businessCustomersList();
    }
}
module.exports = exports = CustomerSearchService;

const { chai, expect } = require('../../../../support/chaiHelper');

const CustomerSearchService = require('../../../../../services/search/service/customerSearchService')

describe('test function calls in customer search service', () => {

    it('should call storeCustomersList function in the provider', async () => {
        const customerSearchService = new CustomerSearchService({storeIds: [1]})
        const spy = chai.spy.on(customerSearchService.provider, "storeCustomersList");
        await customerSearchService.storeCustomersList();
        expect(spy).to.have.been.called();
    })

    it('should call businessCustomersList function in the provider', async () => {
        const customerSearchService = new CustomerSearchService({businessId: 1})
        const spy = chai.spy.on(customerSearchService.provider, "businessCustomersList");
        await customerSearchService.businessCustomersList();
        expect(spy).to.have.been.called();
    })
})
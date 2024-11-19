require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories')
const BusinessCustomerQuery = require('../../../queryHelpers/businessCustomerQuery');

describe('test BusinessCustomerQuery', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id
        });
    });

    it('should create an instance of the class', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const businessCustomerQuery = new BusinessCustomerQuery(centsCustomer.id, business.id);

        expect(businessCustomerQuery).to.have.property('centsCustomerId').equal(centsCustomer.id);
        expect(businessCustomerQuery).to.have.property('businessId').equal(business.id);
    });

    it('getCommercialCustomer should return businessCustomer', async () => {
        const pricingTiers = await factory.create('pricingTiers', {
            businessId: business.id
        });
        const businessCustomer = await factory.create('businessCustomer', {
            isCommercial: true,
            businessId: business.id,
            commercialTierId: pricingTiers.id,
        });
        const businessCustomerQuery = new BusinessCustomerQuery(
            businessCustomer.centsCustomerId,
            business.id,
        );
        const commercialCustomer = await businessCustomerQuery.getCommercialCustomer();

        expect(commercialCustomer).to.have.property('businessId').to.equal(business.id);
        expect(commercialCustomer).to.have.property('id').to.equal(businessCustomer.id);
        expect(commercialCustomer).to.have.property('commercialTierId').to.equal(pricingTiers.id);
    });

    it('details should return businessCustomerDetails', async () => {
        const pricingTiers = await factory.create('pricingTiers', {
            businessId: business.id
        });
        const businessCustomer = await factory.create('businessCustomer', {
            isCommercial: true,
            businessId: business.id,
            commercialTierId: pricingTiers.id,
        });
        const businessCustomerQuery = new BusinessCustomerQuery(
            businessCustomer.centsCustomerId,
            business.id,
        );
        const commercialCustomer = await businessCustomerQuery.details();

        expect(commercialCustomer).to.have.property('businessId').to.equal(business.id);
        expect(commercialCustomer).to.have.property('id').to.equal(businessCustomer.id);
        expect(commercialCustomer).to.have.property('commercialTierId').to.equal(pricingTiers.id);
    });
});

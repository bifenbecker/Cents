require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories')
const TierLookup = require('../../../queryHelpers/tierLookup');

describe('test TierLookup', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id
        });
    });

    it('should create an instance of the class', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            tierId: null,
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        const tierLookup = new TierLookup(serviceOrderItem.id, centsCustomer.id, business.id);

        expect(tierLookup).to.have.property('serviceOrderId').equal(serviceOrderItem.id);
        expect(tierLookup).to.have.property('centsCustomerId').equal(centsCustomer.id);
        expect(tierLookup).to.have.property('businessId').equal(business.id);

    });

    it('tierId should return null if serviceOrderId and centsCustomerId not passed', async () => {
        const tierLookup = new TierLookup(null, null, business.id);
        const tierId = await tierLookup.tierId();

        expect(tierId).to.equal(null);
    });

    it('tierId should return serviceOrder id', async () => {
        const pricingTiers = await factory.create('pricingTiers', {
            businessId: business.id
        })
        const serviceOrderWithTiers = await factory.create('serviceOrder', {
            storeId: store.id,
            tierId: pricingTiers.id,
        })
        const serviceOrderItemWithTiers = await factory.create('serviceOrderItem', {
            orderId: serviceOrderWithTiers.id,
        });
        const tierLookup = new TierLookup(serviceOrderWithTiers.id, null, business.id);
        const tierId = await tierLookup.tierId();

        expect(tierId).to.not.be.undefined;
        expect(tierId).to.not.be.null;
        expect(tierId).to.equal(pricingTiers.id);
    })

    it(`tierId should return null if ServiceOrder with passed id doesn't exist`, async () => {
        const tierLookup = new TierLookup(-1, null, business.id);
        const tierId = await tierLookup.tierId();

        expect(tierId).to.be.null;
    })

    it('tierId should return commercialTierId of CommercialCustomer', async () => {
        const pricingTiers = await factory.create('pricingTiers', {
            businessId: business.id
        })
        const businessCustomer = await factory.create('businessCustomer', {
            isCommercial: true,
            businessId: business.id,
            commercialTierId: pricingTiers.id,
        })
        const tierLookup = new TierLookup(null, businessCustomer.centsCustomerId, business.id);
        const tierId = await tierLookup.tierId();

        expect(tierId).to.not.be.undefined;
        expect(tierId).to.not.be.null;
        expect(tierId).to.equal(pricingTiers.id);
    })

    it(`tierId should return null if BusinessCustomer with commercialTierId doesn't exist`, async () => {
        const businessCustomer = await factory.create('businessCustomer', {
            isCommercial: true,
            businessId: business.id,
        })
        const tierLookup = new TierLookup(null, businessCustomer.centsCustomerId, business.id);
        const tierId = await tierLookup.tierId();

        expect(tierId).to.be.null;
    })

})
require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const toggleCommercial = require('../../../../uow/customer/toggleCommercial');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const BusinessCustomer = require('../../../../models/businessCustomer');

describe('test toggle commercial customer uow', () => {
    let centsCustomer, businessCustomer, pricingTier;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        pricingTier = await factory.create(FN.pricingTier);
        businessCustomer = await factory.create(FN.commercialBusinessCustomer, {
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should toggle isCommercial to false', async () => {
        await toggleCommercial({
            businessCustomer,
            isCommercial: false,
            commercialTierId: null,
            isInvoicingEnabled: false,
        });

        businessCustomer = await BusinessCustomer.query().findById(businessCustomer.id);

        expect(businessCustomer).to.have.property('isCommercial').to.be.false;
        expect(businessCustomer).to.have.property('commercialTierId').to.be.null;
        expect(businessCustomer).to.have.property('isInvoicingEnabled').to.be.false;
    });

    it('should update commercial tier id', async () => {
        pricingTier = await factory.create(FN.pricingTier);

        await toggleCommercial({
            businessCustomer,
            isCommercial: true,
            commercialTierId: pricingTier.id,
        });

        businessCustomer = await BusinessCustomer.query().findById(businessCustomer.id);

        expect(businessCustomer).to.have.property('isCommercial').to.be.true;
        expect(businessCustomer).to.have.property('commercialTierId').to.equal(pricingTier.id);
        expect(businessCustomer).to.have.property('isInvoicingEnabled').to.be.false;
    });

    it('should update isInvoicingEnabled to true', async () => {
        await toggleCommercial({
            businessCustomer,
            isCommercial: true,
            isInvoicingEnabled: true,
        });

        businessCustomer = await BusinessCustomer.query().findById(businessCustomer.id);

        expect(businessCustomer).to.have.property('isInvoicingEnabled').to.be.true;
    });

    it('should update isInvoicingEnabled to false', async () => {
        businessCustomer = await factory.create(FN.commercialBusinessCustomer, {
            centsCustomerId: centsCustomer.id,
            isCommercial: true,
            isInvoicingEnabled: true,
        });

        await toggleCommercial({
            businessCustomer,
            isCommercial: true,
            isInvoicingEnabled: false,
        });

        businessCustomer = await BusinessCustomer.query().findById(businessCustomer.id);

        expect(businessCustomer).to.have.property('isInvoicingEnabled').to.be.false;
    });

    it('should throw error for not passing the payload', async () => {
        expect(toggleCommercial()).rejectedWith(Error);
    });
});

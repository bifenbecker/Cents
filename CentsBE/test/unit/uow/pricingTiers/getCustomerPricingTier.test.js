require('../../../testHelper');
const sinon = require('sinon');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getCustomerPricingTier = require('../../../../uow/pricingTiers/getCustomerPricingTier');
const CentsCustomer = require('../../../../models/centsCustomer');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');
const BusinessCustomer = require('../../../../models/businessCustomer');

describe('test get customer pricing tier', () => {
    let centsCustomer;
    let commercialPricingTier;
    let laundromatBusiness;

    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        commercialPricingTier = await factory.create('commercialPricingTier', {
            businessId: laundromatBusiness.id,
        });
        await factory.create('commercialBusinessCustomer', {
            centsCustomerId: centsCustomer.id,
            commercialTierId: commercialPricingTier.id,
            businessId: laundromatBusiness.id,
        });
    });

    it('should return same payload when no customer auth', async () => {
        const initialPayload = {
            storeDeliverySettings: {
                storeId: 1,
            },
        };
        const result = await getCustomerPricingTier(initialPayload);

        expect(result).equals(initialPayload);
    });

    it('should retrieve commercial tier for customer', async () => {
        const initialPayload = {
            currentCustomer: {
                id: centsCustomer.id,
            },
            storeDeliverySettings: {
                storeId: 1,
            },
        };
        const result = await getCustomerPricingTier(initialPayload);

        expect(result).to.have.property('pricingTier');
        expect(result.pricingTier.businessId).equals(commercialPricingTier.businessId);
        expect(result.pricingTier.id).equals(commercialPricingTier.id);
        expect(result.pricingTier.name).equals(commercialPricingTier.name);
        expect(result.pricingTier.type).equals(commercialPricingTier.type);
    });

    it('should not retrieve tier for commercial customer', async () => {
        const initialPayload = {
            currentCustomer: {
                id: centsCustomer.id,
            },
            storeDeliverySettings: {
                storeId: 1,
            },
        };

        await BusinessCustomer.query()
            .patch({
                deletedAt: '2022-08-10T12:59:32.582Z',
            })
            .where({'centsCustomerId': centsCustomer.id, 'businessId': laundromatBusiness.id});

        const result = await getCustomerPricingTier(initialPayload);

        expect(result).to.have.property('pricingTier').to.be.undefined;
    });

    it('should throw Error', async () => {
        const errorMessage = 'Unprovided error!';
        sinon.stub(CentsCustomer, 'query').throws(new Error(errorMessage));

        await expect(
            getCustomerPricingTier({ currentCustomer: { id: MAX_DB_INTEGER } }),
        ).to.be.rejectedWith(errorMessage);
    });
});

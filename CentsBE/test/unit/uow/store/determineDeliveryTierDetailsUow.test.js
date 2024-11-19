require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const StoreSetting = require('../../../../models/storeSettings');
const determineDeliveryTierDetails = require('../../../../uow/store/determineDeliveryTierDetailsUow');
const { deliveryPriceTypes, pricingTiersTypes } = require('../../../../constants/constants');

describe('test determineDeliveryTierDetails UoW', () => {
    let store, pricingTier;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
        pricingTier = await factory.create(FACTORIES_NAMES.pricingTier, {
            businessId: store.businessId,
            type: pricingTiersTypes.DELIVERY,
        });
    });

    it('should return false if tier information is set to RETAIL', async () => {
        const storeSettings = await StoreSetting.query().findOne({ storeId: store.id });
        const output = await determineDeliveryTierDetails({ storeSettings });

        // assert
        expect(output.hasDeliveryTier).to.be.false;
    });

    it('should return false if deliveryTierId is null but pricing is set to DELIVERY_TIER', async () => {
        const updatedStoreSettings = await StoreSetting.query()
            .patch({
                deliveryTierId: null,
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const output = await determineDeliveryTierDetails({ storeSettings: updatedStoreSettings });

        // assert
        expect(output.hasDeliveryTier).to.be.false;
    });

    it('should return false if deliveryTierId is populated but pricing is set to RETAIL', async () => {
        const updatedStoreSettings = await StoreSetting.query()
            .patch({
                deliveryTierId: pricingTier.id,
                deliveryPriceType: deliveryPriceTypes.RETAIL,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const output = await determineDeliveryTierDetails({ storeSettings: updatedStoreSettings });

        // assert
        expect(output.hasDeliveryTier).to.be.false;
    });

    it('should return false if deliveryTierId is populated but pricing is set to RETAIL', async () => {
        const updatedStoreSettings = await StoreSetting.query()
            .patch({
                deliveryTierId: pricingTier.id,
                deliveryPriceType: deliveryPriceTypes.RETAIL,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const output = await determineDeliveryTierDetails({ storeSettings: updatedStoreSettings });

        // assert
        expect(output.hasDeliveryTier).to.be.false;
    });

    it('should return true if deliveryTierId is populated and pricing is set to DELIVERY_TIER', async () => {
        const updatedStoreSettings = await StoreSetting.query()
            .patch({
                deliveryTierId: pricingTier.id,
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const output = await determineDeliveryTierDetails({ storeSettings: updatedStoreSettings });

        // assert
        expect(output.hasDeliveryTier).to.be.true;
    });

    it('should throw error if storeSettings is not defined', async () => {
        try {
            await determineDeliveryTierDetails({});
        } catch (error) {
            console.log(error);
            return error;
        }

        // assert error type
        expect(error).to.be.an('Error');

        // assert error message - here, since StoreSettings is undefined, first property reading should fail
        expect(error.message).to.contain(`Cannot read properties of undefined (reading 'deliveryTierId')`);
    });
});

require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const updateServicePriceUow = require('../../../../uow/pricingTiers/updateServicePriceUow');

describe('test updateServicePriceUow', () => {
    it('should update the service min quantity of a tier', async () => {
        const servicePrice = await factory.create('pricingTierServicePrice', {
            minQty: 10,
          });
        const payload = {
            tierId: servicePrice.pricingTierId,
            serviceId: servicePrice.serviceId,
            field: 'minQty',
            value: 9,
        };
        const uowOutput = await updateServicePriceUow(payload);
        expect(uowOutput.updatedServicePrice.id).to.equal(servicePrice.id);
        expect(uowOutput.updatedServicePrice.minQty).to.equal(payload.value);
    });

    it('should update the Service price of a tier', async () => {
        const servicePrice = await factory.create('pricingTierServicePrice', {
            storePrice: 0,
          });
        const payload = {
            tierId: servicePrice.pricingTierId,
            serviceId: servicePrice.serviceId,
            field: 'storePrice',
            value: 2.50,
        };

        const uowOutput = await updateServicePriceUow(payload);
        expect(uowOutput.updatedServicePrice.id).to.equal(servicePrice.id);
        expect(uowOutput.updatedServicePrice.storePrice).to.equal(payload.value);
    });
});

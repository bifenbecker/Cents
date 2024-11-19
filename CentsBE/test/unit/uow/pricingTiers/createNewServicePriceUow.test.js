require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const createNewServicePriceUow = require('../../../../uow/pricingTiers/createNewServicePriceUow');

describe('test createNewServicePriceUow', () => {
    it('should create the Service of a tier', async () => {
        const servicePrice = await factory.create('serviceMaster', {
            minQty: 10,
          });
        const pricingTier = await factory.create('pricingTiers');
        const payload = {
            tierId: pricingTier.id,
            serviceId: servicePrice.id,
            field: 'minQty',
            value: 9,
        };
        const uowOutput = await createNewServicePriceUow(payload);
        expect(uowOutput.newServicePrice.serviceId).to.equal(servicePrice.id);
        expect(uowOutput.newServicePrice.pricingTierId).to.equal(pricingTier.id);
        expect(uowOutput.newServicePrice.minQty).to.equal(payload.value);
    });
});

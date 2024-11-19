require('../../../testHelper');
const { expect} = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateZonesUow = require('../../../../uow/delivery/updateZonesUow');
const Zone = require('../../../../models/zone');

describe('test updateZonesUow', () => {
    let tier, payload, updatedZone;
    beforeEach(async () => {
        zone = await factory.create('zone');
        tier = await factory.create('pricingTierDelivery');
        payload = {
            "zones" : [
              {
              id : zone.id,
              deliveryTierId: tier.id
              },
            ]
          }
    });
    it('should update zones with deliveryTier Ids', async () => {
        await updateZonesUow(payload);
        updatedZone = await Zone.query().findById(zone.id);
        expect(updatedZone).to.have.a.property('deliveryTierId').to.equal(tier.id);
        expect(updatedZone).to.have.a.property('id').to.equal(zone.id);
    });
});


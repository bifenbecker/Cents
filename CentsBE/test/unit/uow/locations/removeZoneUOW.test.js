require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const Zone = require('../../../../models/zone');
const ShiftTimingZone = require('../../../../models/shiftTimingZone');

const removeZoneUOW = require('../../../../uow/locations/removeZoneUOW');

const callRemoveZoneUOW = (zoneId) => removeZoneUOW({ zoneId });

describe('test removeZone UOW', () => {
    let deliveryTier, zone, shiftTimingZone;

    beforeEach(async () => {
        deliveryTier = await factory.create('pricingTierDelivery');
        zone = await factory.create('zone', { deliveryTierId: deliveryTier.id });
        shiftTimingZone = await factory.create('shiftTimingZone', { zoneIds: [zone.id] });
    });

    it('should soft delete zone and remove delivery tier id', async () => {
        await callRemoveZoneUOW(zone.id);

        const updatedZone = await Zone.query().findById(zone.id);
        expect(updatedZone.deliveryTierId).to.be.null;
        expect(updatedZone.deletedAt).to.not.be.null;
    });

    it('should remove zoneId from related shiftTimingZones', async () => {
        await callRemoveZoneUOW(zone.id);

        const updatedShiftTimingZone = await ShiftTimingZone.query().findById(shiftTimingZone.id);
        expect(updatedShiftTimingZone.zoneIds).to.not.include(zone.id);
    });
});

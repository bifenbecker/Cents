require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const UpdateOwnDriverDeliverySettingsService = require('../../../../services/deliverySettings/updateOwnDriverDeliverySettings');
const Zone = require('../../../../models/zone');

describe('test UpdateOwnDriverDeliverySettingsService', async () => {
    let zones, store, ownDeliverySettings, deliveryTier, laundromatBusiness, body = {}, zone;

    beforeEach(async () => {

        laundromatBusiness = await factory.create('laundromatBusiness');

        store = await factory.create('store', {
            businessId: laundromatBusiness.id
        });

    });

    describe("update zone's delivery tier id", () => {
        it('should update delivery tier id to null', async () => {

            ownDeliverySettings = await factory.create('ownDeliverySetting', {
                hasZones: true,
                storeId: store.id,
            });

            zones = await factory.createMany('zone', 2, {
                ownDeliverySettingsId: ownDeliverySettings.id,
            });

            ownDeliverySettingsObject = await (new UpdateOwnDriverDeliverySettingsService(store.id, body));
            ownDeliverySettingsObject.ownDeliverySettings = ownDeliverySettings;
            await ownDeliverySettingsObject.updateZonesDeliveryTierId({ deliveryTierId: null });
            zones = await Zone.query().select('deliveryTierId').where('ownDeliverySettingsId', ownDeliverySettings.id);
            expect(zones[0]).to.have.property('deliveryTierId').to.be.null;
            expect(zones[1]).to.have.property('deliveryTierId').to.be.null;
        });

        it('should update delivery tier id to assigned tier', async () => {

            ownDeliverySettings = await factory.create('ownDeliverySetting', {
                hasZones: true,
                storeId: store.id,
            });

            deliveryTier = await factory.create('pricingTierDelivery', {
                businessId: laundromatBusiness.id
            });

            zones = await factory.createMany('zone', 2, {
                ownDeliverySettingsId: ownDeliverySettings.id,
            });

            ownDeliverySettingsObject = await (new UpdateOwnDriverDeliverySettingsService(store.id, body));
            ownDeliverySettingsObject.ownDeliverySettings = ownDeliverySettings;
            await ownDeliverySettingsObject.updateZonesDeliveryTierId({ deliveryTierId: deliveryTier.id, });
            zones = await Zone.query().select('deliveryTierId').where('ownDeliverySettingsId', ownDeliverySettings.id);
            expect(zones[0]).to.have.property('deliveryTierId').to.equal(deliveryTier.id);
            expect(zones[1]).to.have.property('deliveryTierId').to.equal(deliveryTier.id);
        });

    });

    // let ownDriverDeliverySettings, businessId;
    // const zipCodes = ['94555', '94556'];
    // beforeEach(async () => {
    //     ownDriverDeliverySettings = await factory.create('ownDeliverySetting', { zipCodes: ['01001'] });
    //     const store = await Store.query().findOne({ id: ownDriverDeliverySettings.storeId });
    //     businessId = store.businessId;
    // });
    // describe('own delivery settings is not available', () => {
    //     it('should throw error', async () => {
    //         const payload = { hasZones: false, zipCodes: ["01001"] };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             0, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error).to.be.an('Error');
    //     });
    // });
    // describe('updating zipCodes and zones', () => {
    //     beforeEach(async () => {
    //         zone = await factory.create('zone', {
    //             ownDeliverySettingsId: ownDriverDeliverySettings.id
    //         })
    //     });
    //     it('should update hasZones(false) and zipCodes', async () => {
    //         const payload = { hasZones: false, zipCodes };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         await serviceObj.execute();
    //         const updatedSettings = await OwnDeliverySettings.query()
    //             .findOne({ id: ownDriverDeliverySettings.id });
    //         expect(updatedSettings.hasZones).to.false;
    //         expect(updatedSettings.zipCodes).to.have.lengthOf(2);
    //         expect(updatedSettings.zipCodes).to.include.members(zipCodes);
    //     });
    //     it('should update hasZones(true) and zones', async () => {
    //         const newZipCodes = ['01001'];
    //         const newZoneName = 'New Zone Name';
    //         const changedZoneName = 'Changed Zone Name';
    //         const payload = { hasZones: true, zones: [
    //             { ...zone, name: changedZoneName, zipCodes },
    //             { name: newZoneName, zipCodes: newZipCodes }
    //         ]};
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         await serviceObj.execute();
    //         const updatedSettings = await OwnDeliverySettings.query()
    //             .findOne({ id: ownDriverDeliverySettings.id });
    //         const zones = await Zone.query()
    //             .where({ ownDeliverySettingsId: ownDriverDeliverySettings.id });
    //         const newZone = zones.find(({ name }) => name === newZoneName);
    //         const existingZone = zones.find(({ id }) => id === zone.id);
    //         expect(updatedSettings.hasZones).to.true;
    //         expect(zones).to.have.lengthOf(2);
    //         expect(newZone.name).to.equal(newZoneName);
    //         expect(newZone.ownDeliverySettingsId).to.equal(ownDriverDeliverySettings.id);
    //         expect(newZone.zipCodes).to.have.lengthOf(newZipCodes.length);
    //         expect(newZone.zipCodes).to.include.members(newZipCodes);
    //         expect(existingZone.name).to.equal(changedZoneName);
    //         expect(existingZone.zipCodes).to.have.lengthOf(zipCodes.length);
    //         expect(existingZone.zipCodes).to.include.members(zipCodes);
    //     });
    //     it('should throw error if zipCodes are invalid', async () => {
    //         const payload = { hasZones: false, zipCodes: ["00000"] };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error.message).to.equal('invalid_zipcode');
    //     });
    //     it('should throw error if zipCodes are part of another store', async () => {
    //         const newStore = await factory.create('store', { businessId });
    //         await factory.create('ownDeliverySetting', { zipCodes: ['94555'], storeId: newStore.id });
    //         const payload = { hasZones: false, zipCodes };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error.message).to.equal('zipcode_exists');
    //     });
    //     it('should throw error if zones\' zipCodes are invalid', async () => {
    //         const payload = { hasZones: true, zones: [
    //             { name: 'newZoneName', zipCodes: ["00000"] }
    //         ]};
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error.message).to.equal('invalid_zipcode');
    //     });
    //     it('should throw error if zones\' zipCodes are part of another store', async () => {
    //         const newStore = await factory.create('store', { businessId });
    //         await factory.create('ownDeliverySetting', { zipCodes: ['94555'], storeId: newStore.id });
    //         const payload = { hasZones: true, zones: [
    //             { name: 'newZoneName', zipCodes: ["94555"] }
    //         ]};
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error.message).to.equal('zipcode_exists');
    //     });
    //     it('should throw error if hasZones is false, and zip codes are not there', async () => {
    //         const payload = { hasZones: false };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error).to.be.an('Error');
    //     });
    //     it('should throw error if hasZones is true, and zones are not there', async () => {
    //         const payload = { hasZones: true };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         let error;
    //         try {
    //             await serviceObj.execute()
    //         } catch(err) {
    //             error = err;
    //         }
    //         expect(error).to.be.an('Error');
    //     });
    // });
    // describe('updating deliveryFeeInCents', () => {
    //     it('should update deliveryFee', async () => {
    //         const deliveryFeeInCents = 1002;
    //         const payload = { deliveryFeeInCents };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         await serviceObj.execute();
    //         const updatedSettings = await OwnDeliverySettings.query()
    //             .findOne({ id: ownDriverDeliverySettings.id });
    //         expect(updatedSettings.deliveryFeeInCents).to.equal(deliveryFeeInCents);
    //     });
    // });
    // describe('updating active', () => {
    //     it('should update to true', async () => {
    //         const active = true;
    //         const payload = { active };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         await serviceObj.execute();
    //         const updatedSettings = await OwnDeliverySettings.query()
    //             .findOne({ id: ownDriverDeliverySettings.id });
    //         expect(updatedSettings.active).to.true;
    //     });
    //     it('should update to false', async () => {
    //         const active = false;
    //         const payload = { active };
    //         const serviceObj = new UpdateOwnDriverDeliverySettingsService(
    //             ownDriverDeliverySettings.storeId, payload,
    //         );
    //         await serviceObj.execute();
    //         const updatedSettings = await OwnDeliverySettings.query()
    //             .findOne({ id: ownDriverDeliverySettings.id });
    //         expect(updatedSettings.active).to.false;
    //     });
    // });
});

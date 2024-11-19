require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const OwnDeliverySettings = require('../../../../../../models/ownDeliverySettings');
const getOwnDriverDeliverySettings = require('../../../../../../uow/liveLink/store/getOwnDriverDeliverySettings/getOwnDriverDeliverySettings');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

describe('test getOwnDriverDeliverySettings UoW', () => {
    let store, payload;

    it('should get own delivery sellings', async () => {
        store = await factory.create(FN.store);

        await factory.create(FN.ownDeliverySetting, {
            storeId: store.id
        });

        payload = {
            storeId: store.id,
        }

        const res = await getOwnDriverDeliverySettings(payload);

        const ownDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(ownDeliverySettings).to.have.property('active');
        expect(ownDeliverySettings).to.have.property('storeId');
        expect(ownDeliverySettings).to.have.property('zipCodes');
        expect(ownDeliverySettings).to.have.property('hasZones');
        expect(ownDeliverySettings).to.have.property('deliveryFeeInCents');
        expect(ownDeliverySettings).to.have.property('returnDeliveryFeeInCents');
        expect(ownDeliverySettings).to.have.property('deliveryWindowBufferInHours');
        expect(res.deliverySettingsService).to.have.property('storeId');
    });

    it('should not get own delivery sellings', async () => {
        store = await factory.create(FN.store);

        payload = {
            storeId: store.id,
        }

        const res = await getOwnDriverDeliverySettings(payload);

        const ownDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(ownDeliverySettings).to.be.undefined;
        expect(res.ownDriverDeliverySettings).to.be.empty;
        expect(res.deliverySettingsService).to.have.property('storeId');
    });

    it('should fail to get for not passing the payload', async () => {
        payload = {};
        expect(getOwnDriverDeliverySettings(payload)).rejectedWith(Error);
    });
});
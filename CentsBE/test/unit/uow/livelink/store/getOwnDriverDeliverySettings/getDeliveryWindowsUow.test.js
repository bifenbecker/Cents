require('../../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const OwnDeliverySettings = require('../../../../../../models/ownDeliverySettings');
const GeneralDeliverySettingsService = require('../../../../../../services/deliverySettings/generalDeliverySettings');
const getDeliveryWindows = require('../../../../../../uow/liveLink/store/getOwnDriverDeliverySettings/getDeliveryWindows');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

describe('test getDeliveryWindows UoW', () => {
    let store, ownDriverDeliverySettings, payload;

    it('should change active property', async () => {
        store = await factory.create(FN.store);

        ownDriverDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });

        const deliverySettingsService = new GeneralDeliverySettingsService(store.id);

        payload = {
            ownDriverDeliverySettings,
            zipCode: store.zipCode,
            deliverySettingsService,
        }

        const initialPayload = cloneDeep(payload);

        const res = await getDeliveryWindows(payload);

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
        expect(initialPayload.ownDriverDeliverySettings.active).to.not.equal(res.ownDriverDeliverySettings.active);
    });

    it('should not change active property', async () => {
        store = await factory.create(FN.store);

        const deliverySettingsService = new GeneralDeliverySettingsService(store.id);

        payload = {
            ownDriverDeliverySettings: {},
            zipCode: store.zipCode,
            deliverySettingsService,
        }

        const initialPayload = cloneDeep(payload);

        const res = await getDeliveryWindows(payload);

        const ownDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(ownDeliverySettings).to.be.undefined;
        expect(initialPayload.ownDriverDeliverySettings.active).to.equal(res.ownDriverDeliverySettings.active);
    });

    it('should fail to get for not passing the payload', async () => {
        payload = {};
        expect(getDeliveryWindows(payload)).rejectedWith(Error);
    });
});
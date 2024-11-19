require('../../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const getMappedOwnDriverDeliverySettings = require('../../../../../../uow/liveLink/store/getOwnDriverDeliverySettings/getMappedOwnDriverDeliverySettings');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

describe('test getMappedOwnDriverDeliverySettings UoW', () => {
    let store, ownDriverDeliverySettings, payload;

    it('should delete hasZones and zipCodes properties', async () => {
        store = await factory.create(FN.store);

        ownDriverDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });

        payload = {
            ownDriverDeliverySettings
        }

        const initialPayload = cloneDeep(payload);

        const res = await getMappedOwnDriverDeliverySettings(payload);

        expect(initialPayload.ownDriverDeliverySettings).to.have.property('hasZones');
        expect(res).to.not.have.property('zipCodes');
        expect(res).to.not.have.property('hasZones');
    });

    it('should not delete properties if ownDriverDeliverySettings without id', async () => {
        store = await factory.create(FN.store);

        payload = {
            ownDriverDeliverySettings: {},
        }

        const initialPayload = cloneDeep(payload);

        const res = await getMappedOwnDriverDeliverySettings(payload);

        expect(initialPayload.ownDriverDeliverySettings).to.not.have.property('hasZones');
        expect(res).to.not.have.property('zipCodes');
        expect(res).to.not.have.property('hasZones');
    });

    it('should fail to get for not passing the payload', async () => {
        payload = {};
        expect(getMappedOwnDriverDeliverySettings(payload)).rejectedWith(Error);
    });
});
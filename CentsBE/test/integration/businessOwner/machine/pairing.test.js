require('../../../testHelper');
const factory = require('../../../factories');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { deviceStatuses } = require('../../../../constants/constants');
const { expect } = require('../../../support/chaiHelper');
const Device = require('../../../../models/device');
const Pairing = require('../../../../models/pairing');

const getApiEndpoint = (id, path) => `/api/v1/business-owner/machine/${id}/${path}`;

describe('test pairing/unpairing api', () => {
    let token, user, business, store, machine, batch;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            businessId: business.id,
            storeId: store.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    describe('pairing api', () => {
        it('should pair a device', async () => {
            const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
                batchId: batch.id,
                name: 'AA100',
                isPaired: false,
            });

            const result = await assertPostResponseSuccess({
                url: getApiEndpoint(machine.id, 'pair'),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                },
                token,
            });

            expect(result.body.success).to.be.true;
            expect(result.body.machine.id).to.equal(machine.id);

            const deviceInDb = await Device.query().findById(device.id);
            expect(deviceInDb.isPaired).to.be.true;

            const pairingInDb = await Pairing.query()
                .where({
                    machineId: machine.id,
                    deviceId: device.id,
                })
                .first();
            expect(pairingInDb).to.exist;
        });

        it('should fail if device id is not passed', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, 'pair'),
                body: {
                    storeId: store.id,
                    pricePerTurnInCents: 10,
                },
                token,
                code: 422,
            });
        });
    });

    describe('unpairing api', () => {
        it('should unpair a device', async () => {
            const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
                batchId: batch.id,
                name: 'AB100',
                isPaired: true,
            });
            const pairing = await Pairing.query()
                .insert({
                    machineId: machine.id,
                    deviceId: device.id,
                })
                .returning('*');

            const result = await assertPostResponseSuccess({
                url: getApiEndpoint(machine.id, 'un-pair'),
                token,
            });

            expect(result.body.success).to.be.true;
            expect(result.body.machine.id).to.equal(machine.id);

            const deviceInDb = await Device.query().findById(device.id);
            expect(deviceInDb.isPaired).to.be.false;

            const pairingInDb = await Pairing.query().findById(pairing.id);
            expect(pairingInDb.deletedAt).to.not.be.null;
        });

        it('should fail if machine id is not valid', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(-1, 'un-pair'),
                token,
                code: 500,
            });
        });
    });
});

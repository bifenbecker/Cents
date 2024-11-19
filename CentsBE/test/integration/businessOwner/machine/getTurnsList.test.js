require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

const getAPIEndpoint = (id) => `/api/v1/business-owner/machine/${id}/turns`;

describe('test getTurnsList api', () => {
    let machine, token, store;

    beforeEach(async () => {
        const user = await factory.create('userWithBusinessOwnerRole'),
            business = await factory.create('laundromatBusiness', { userId: user.id });

        store = await factory.create('store', {
            businessId: business.id,
        });
        machine = await factory.create('machine', {
            storeId: store.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    it('should throw an error if token is not sent', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should throw an error if token is not correct', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token: '123678a',
            code: 401,
            expectedError: 'Invalid token.',
        });
    });

    it('should throw an error if user does not exist', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token: generateToken({
                id: -1,
            }),
            code: 403,
            expectedError: 'User not found',
        });
    });

    it('should throw an error if user does not have a valid role', async () => {
        const user = await factory.create('user');
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token: generateToken({
                id: user.id,
            }),
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should return turns list', async () => {
        const device1 = await factory.create('device', {
                name: 'AA955',
            }),
            turn1 = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device1.id,
            });

        const device2 = await factory.create('device', {
                name: 'AA956',
            }),
            turn2 = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device2.id,
            });

        const { body } = await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token,
        });

        expect(body.turns[0].id).to.equal(turn2.id);
        expect(body.turns[1].id).to.equal(turn1.id);
    });

    it('should return turns list with hasMore property', async () => {
        const device1 = await factory.create('device', {
            name: 'AA955',
        });

        await factory.create('turn', {
            storeId: store.id,
            machineId: machine.id,
            deviceId: device1.id,
        });

        const device2 = await factory.create('device', {
                name: 'AA956',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device2.id,
            });

        const { body } = await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            params: { page: 1, limit: 1 },
            token,
        });

        expect(body.turns[0].id).to.equal(turn.id);
        expect(body.hasMore).to.be.true;
    });

    it('should return turns list without deleted turns', async () => {
        const device = await factory.create('device', {
                name: 'AA955',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device.id,
            });

        await factory.create('turn', {
            storeId: store.id,
            machineId: machine.id,
            deletedAt: '2016-06-22 19:10:25-07',
        });

        const { body } = await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            params: { page: 1, limit: 1 },
            token,
        });

        expect(body.turns[0].id).to.equal(turn.id);
        expect(body.turns.length).to.equal(1);
    });

    it('should fail if machine was not found', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(99999),
            params: { page: 1 },
            token,
            code: 500,
            expectedError: 'Invalid machine id.',
        });
    });
});

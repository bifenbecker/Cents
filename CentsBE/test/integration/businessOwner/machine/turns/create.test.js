require('../../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect, chai } = require('../../../../support/chaiHelper');
const { serviceTypes, deviceStatuses } = require('../../../../../constants/constants');
const Turns = require('../../../../../models/turns');
const eventEmitter = require('../../../../../config/eventEmitter');

const getAPIEndpoint = (machineId) => `/api/v1/business-owner/machine/${machineId}/turn`;

const createMachinePairingAndPricing = async (machineId) => {
    const device = await factory.create('device', {
        status: deviceStatuses.ONLINE,
        isPaired: true,
    });
    await factory.create('pairing', {
        machineId: machineId,
        deviceId: device.id,
    });
    await factory.create('machinePricing', {
        machineId: machineId,
        price: 11,
    });
};

describe('test create turn api', () => {
    let user, business, store, machine, token, emitSpy;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
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
        emitSpy = chai.spy.on(eventEmitter, 'emit');
    });

    afterEach(() => {
        chai.spy.restore(eventEmitter);
    });

    it('should throw an error if token is not sent', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should throw an error if token is not correct', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: '123678a',
            code: 401,
            expectedError: 'Invalid token.',
        });
    });

    it('should throw an error if user does not exist', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: generateToken({
                id: -1,
            }),
            code: 403,
            expectedError: 'User not found',
        });
    });

    it('should throw an error if user does not have a valid role', async () => {
        user = await factory.create('user');
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: generateToken({
                id: user.id,
            }),
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should throw an error if machine was not found', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(99999),
            body,
            token,
            code: 500,
        });
    });

    it('should throw an error if machine is not paired', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: 'Machine is not paired',
        });
    });

    it('should create a turn for a technical service', async () => {
        await createMachinePairingAndPricing(machine.id);

        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        const result = await assertPostResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const turn = await Turns.query().findById(result.body.result.turnId);
        expect(turn).to.not.be.null;

        expect(emitSpy).to.have.been.called.with('turnCreated', { turnId: turn.id });
    });

    it('should create a turn for a customer service', async () => {
        await createMachinePairingAndPricing(machine.id);
        const centsCustomer = await factory.create('centsCustomer');

        const body = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            centsCustomerId: centsCustomer.id,
            note: 'Just fix it',
            quantity: 1,
        };

        const result = await assertPostResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const turn = await Turns.query().findById(result.body.result.turnId);
        expect(turn).to.not.be.null;

        expect(emitSpy).to.have.been.called.with('turnCreated', { turnId: turn.id });
    });

    it('should create a turn for a full service', async () => {
        await createMachinePairingAndPricing(machine.id);
        const centsCustomer = await factory.create('centsCustomer');

        const body = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            centsCustomerId: centsCustomer.id,
            note: 'Just fix it',
            quantity: 1,
        };

        const result = await assertPostResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const turn = await Turns.query().findById(result.body.result.turnId);
        expect(turn).to.not.be.null;

        expect(emitSpy).to.have.been.called.with('turnCreated', { turnId: turn.id });
    });
});

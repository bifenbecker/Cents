require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const {
    assertPutResponseError,
    assertPutResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const Machine = require('../../../../models/machine');
const MachinePricing = require('../../../../models/machinePricing');
const { expect } = require('../../../support/chaiHelper');

const getAPIEndpoint = (id) => `/api/v1/business-owner/machine/${id}`;

describe('test updateMachineDetails api', () => {
    let user, business, store, machine, token;

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
    });

    it('should throw an error if token is not sent', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should throw an error if token is not correct', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: '123678a',
            code: 401,
            expectedError: 'Invalid token.',
        });
    });

    it('should throw an error if user does not exist', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
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
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token: generateToken({
                id: user.id,
            }),
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should update name field', async () => {
        const body = {
            field: 'name',
            value: 'DW100',
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const result = await Machine.query().findById(machine.id);
        expect(result.name).to.equal(body.value);
    });

    it('should update pricePerTurnInCents field', async () => {
        const machineType = await factory.create('machineType', {
                name: 'WASHER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });

        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });

        await factory.create('machinePricing', {
            machineId: machine.id,
        });

        const body = {
            field: 'pricePerTurnInCents',
            value: 11,
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const result = await MachinePricing.query().findOne({
            machineId: machine.id,
        });
        expect(result.price).to.equal(body.value);
    });

    it('should update serialNumber field', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const result = await Machine.query().findById(machine.id);
        expect(result.serialNumber).to.equal(body.value);
    });

    it('should update turnTimeInMinutes field', async () => {
        const machineType = await factory.create('machineType', {
                name: 'DRYER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });

        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });

        const body = {
            field: 'turnTimeInMinutes',
            value: 23,
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });

        const result = await Machine.query().findById(machine.id);
        expect(result.turnTimeInMinutes).to.equal(body.value);
    });

    it('should throw an error if machine was not found', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(99999),
            body,
            token,
            code: 500,
        });
    });
});

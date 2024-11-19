require('../../../testHelper');
const {
    assertPutResponseError,
    assertPutResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');

const getAPIEndpoint = (id) => `/api/v1/employee-tab/machines/${id}`;

describe('test updateMachineDetails validation', () => {
    let store, machine, token;

    beforeEach(async () => {
        store = await factory.create('store');
        machine = await factory.create('machine', {
            storeId: store.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should return error if field is not existing field', async () => {
        const body = {
            field: 'notAField',
            value: 'some value',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError:
                '"field" must be one of [name, pricePerTurnInCents, serialNumber, turnTimeInMinutes]',
        });
    });

    it('should return error if name field is not a string', async () => {
        const body = {
            field: 'name',
            value: 123,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a string',
        });
    });

    it('should return error if name field is longer than 8 characters', async () => {
        const body = {
            field: 'name',
            value: 'LG-12345678',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" length must be less than or equal to 8 characters long',
        });
    });

    it('should return error if name field is empty', async () => {
        const body = {
            field: 'name',
            value: '',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" is not allowed to be empty',
        });
    });

    it('should return error if name field is whitespace', async () => {
        const body = {
            field: 'name',
            value: ' ',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" is not allowed to be empty',
        });
    });

    it('should return error if pricePerTurnInCents field is empty', async () => {
        const body = {
            field: 'pricePerTurnInCents',
            value: null,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a number',
        });
    });

    it('should return error if pricePerTurnInCents field is not a number', async () => {
        const body = {
            field: 'pricePerTurnInCents',
            value: 'some value',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a number',
        });
    });

    it('should return error if pricePerTurnInCents field is less than 1', async () => {
        const body = {
            field: 'pricePerTurnInCents',
            value: 0,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be larger than or equal to 1',
        });
    });

    it('should return error if turnTimeInMinutes field is not a number', async () => {
        const body = {
            field: 'turnTimeInMinutes',
            value: 'some value',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a number',
        });
    });

    it('should return error if turnTimeInMinutes field is not an integer', async () => {
        const body = {
            field: 'turnTimeInMinutes',
            value: 123.67,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be an integer',
        });
    });

    it('should return error if turnTimeInMinutes field is less than 1', async () => {
        const body = {
            field: 'turnTimeInMinutes',
            value: 0,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be larger than or equal to 1',
        });
    });

    it('should return error if turnTimeInMinutes field is bigger than 99', async () => {
        const body = {
            field: 'turnTimeInMinutes',
            value: 100,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be less than or equal to 99',
        });
    });

    it('should return error if turnTimeInMinutes field is empty', async () => {
        const body = {
            field: 'turnTimeInMinutes',
            value: null,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a number',
        });
    });

    it('should return error if serial number is not a string', async () => {
        const body = {
            field: 'serialNumber',
            value: 123,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 422,
            expectedError: '"value" must be a string',
        });
    });

    it('should return error if serial number already exists', async () => {
        const serialNumber = '123e4567-e89b-12d3-a456-4';

        await factory.create('machine', { serialNumber });

        const body = {
            field: 'serialNumber',
            value: serialNumber,
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 409,
            expectedError: 'Barcode already Exists.',
        });
    });

    it('should return error is serial number exceeds specified length', async () => {
        const body = {
            field: 'serialNumber',
            value: '123e4567-e89b-12d3-a456-426655440000',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 409,
            expectedError: 'Barcode length exceeded.',
        });
    });

    it('should pass validation for name field', async () => {
        const body = {
            field: 'name',
            value: 'DW100',
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });
    });

    it('should pass validation for pricePerTurnInCents field', async () => {
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

        const body = {
            field: 'pricePerTurnInCents',
            value: 11,
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });
    });

    it('should pass validation for serialNumber field', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });
    });

    it('should pass validation for turnTimeInMinutes field', async () => {
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
    });

    it('should return error if machine was not found', async () => {
        const body = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
        };

        await assertPutResponseError({
            url: getAPIEndpoint(-1),
            body,
            token,
            code: 500,
        });
    });
});

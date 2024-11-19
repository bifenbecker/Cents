require('../../../../testHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { serviceTypes, deviceStatuses, statuses } = require('../../../../../constants/constants');
const BusinessSettings = require('../../../../../models/businessSettings');

const getAPIEndpoint = (id) => `/api/v1/business-owner/machine/${id}/turn`;
const getEmployeeTabAPIEndpoint = (id) => `/api/v1/employee-tab/machines/${id}/turn`;

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

describe('test createTurnValidation validation', () => {
    let machine, business, store, token, user;

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

    it('should fail when serviceType is not set', async () => {
        const body = {
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"serviceType" is required',
        });
    });

    it('should fail when serviceType is not a string', async () => {
        const body = {
            serviceType: 23,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"serviceType" must be a string',
        });
    });

    it('should fail when serviceType is not from valid values', async () => {
        const body = {
            serviceType: serviceTypes.SELF_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError:
                '"serviceType" must be one of [CUSTOMER_SERVICE, TECHNICAL_SERVICE, FULL_SERVICE]',
        });
    });

    it('should fail when technicianName is empty for technical service', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"technicianName" is required',
        });
    });

    it('should fail when technicianName is not a string', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 324,
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"technicianName" must be a string',
        });
    });

    it('should fail when note is not a string', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 897,
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"note" must be a string',
        });
    });

    it('should fail when centsCustomerId is empty for full service', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            userId: user.id,
            storeId: store.id,
            storeCustomerId: factory.assoc('storeCustomer', 'id'),
            status: statuses.PROCESSING,
        });

        const body = {
            serviceType: serviceTypes.FULL_SERVICE,
            note: 'Just fix it',
            quantity: 1,
            serviceOrderId: serviceOrder.id,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"centsCustomerId" is required',
        });
    });

    it('should fail when centsCustomerId is empty for customer service', async () => {
        const body = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"centsCustomerId" is required',
        });
    });

    it('should fail when centsCustomerId is not a number', async () => {
        const body = {
            serviceType: serviceTypes.FULL_SERVICE,
            centsCustomerId: 'id1',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"centsCustomerId" must be a number',
        });
    });

    it('should fail when quantity is not a number', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: '15LB',
        };

        await assertPostResponseError({
            url: getAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"quantity" must be a number',
        });
    });

    it('should fail when employeeCode is not provided', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 2,
        };

        token = generateToken({
            id: store.id,
        });

        await BusinessSettings.query()
            .patch({
                requiresEmployeeCode: true,
            })
            .where({
                businessId: business.id,
            });

        await assertPostResponseError({
            url: getEmployeeTabAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"employeeCode" is required',
        });
    });

    it('should fail when employeeCode is not a number', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 2,
            employeeCode: 'code-12',
        };

        token = generateToken({
            id: store.id,
        });

        await BusinessSettings.query()
            .patch({
                requiresEmployeeCode: true,
            })
            .where({
                businessId: business.id,
            });

        await assertPostResponseError({
            url: getEmployeeTabAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: '"employeeCode" must be a number',
        });
    });

    it('should fail when employeeCode is not valid', async () => {
        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 2,
            employeeCode: 1,
        };

        token = generateToken({
            id: store.id,
        });

        await BusinessSettings.query()
            .patch({
                requiresEmployeeCode: true,
            })
            .where({
                businessId: business.id,
            });

        await assertPostResponseError({
            url: getEmployeeTabAPIEndpoint(machine.id),
            body,
            token,
            code: 500,
            expectedError: 'Invalid employee code',
        });
    });

    it('should pass validation', async () => {
        await createMachinePairingAndPricing(machine.id);

        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseSuccess({
            url: getAPIEndpoint(machine.id),
            body,
            token,
        });
    });

    it('should pass validation for employee tab', async () => {
        await createMachinePairingAndPricing(machine.id);

        token = generateToken({
            id: store.id,
        });

        const body = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
        };

        await assertPostResponseSuccess({
            url: getEmployeeTabAPIEndpoint(machine.id),
            body,
            token,
        });
    });
});

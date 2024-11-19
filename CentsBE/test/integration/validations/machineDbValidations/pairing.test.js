require('../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const BusinessSettings = require('../../../../models/businessSettings');
const { deviceStatuses } = require('../../../../constants/constants');
const TeamMemberCheckIn = require('../../../../models/teamMemberCheckIn');
const Device = require('../../../../models/device');
const { origins } = require('../../../../constants/constants');

const getApiEndpoint = (id, area) => {
    if (area === origins.EMPLOYEE_APP) {
        return `/api/v1/employee-tab/machines/${id}/pair`;
    } else {
        return `/api/v1/business-owner/machine/${id}/pair`;
    }
};

const createMachineWithType = async (typeName, storeId) => {
    const machineType = await factory.create(FACTORIES_NAMES.machineType, {
        name: typeName,
    });
    const machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
        typeId: machineType.id,
    });
    const machine = await factory.create(FACTORIES_NAMES.machine, {
        storeId: storeId,
        modelId: machineModel.id,
    });

    return machine;
};

const createDevice = async (businessId, storeId, deviceOptions = {}) => {
    const batch = await factory.create(FACTORIES_NAMES.batch, {
        businessId: businessId,
        storeId: storeId,
    });
    const device = await factory.create(FACTORIES_NAMES.device, {
        status: deviceStatuses.ONLINE,
        batchId: batch.id,
        ...deviceOptions,
    });

    return device;
};

const createCheckedInMember = async (businessId, storeId) => {
    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
        businessId: businessId,
    });
    await factory.create(FACTORIES_NAMES.teamMemberStore, {
        teamMemberId: teamMember.id,
        storeId: storeId,
    });
    const teamMemberCheckIn = await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
        teamMemberId: teamMember.id,
        storeId: storeId,
        isCheckedIn: true,
    });

    return { teamMember, teamMemberCheckIn };
};

const makeRequiredEmployeeCode = async (businessId) => {
    await BusinessSettings.query().patch({ requiresEmployeeCode: true }).where({ businessId });
};

describe('test pairing validation', () => {
    describe('employee-tab tests', () => {
        let token, store, machine, device, teamMember, teamMemberCheckIn;

        beforeEach(async () => {
            store = await factory.create(FACTORIES_NAMES.store);
            await makeRequiredEmployeeCode(store.businessId);

            machine = await createMachineWithType('WASHER', store.id);
            device = await createDevice(store.businessId, store.id, { name: 'SP100' });
            ({ teamMember, teamMemberCheckIn } = await createCheckedInMember(
                store.businessId,
                store.id,
            ));
            token = generateToken({
                id: store.id,
            });
        });

        it("should return error if store id is not equal to token's store id", async () => {
            const secondStore = await factory.create(FACTORIES_NAMES.store);

            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                },
                token: generateToken({
                    id: secondStore.id,
                }),
                code: 409,
                expectedError: "Store id should match to current store's id.",
            });
        });

        it('should return error if employee code is not provided', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                },
                token,
                code: 422,
                expectedError: 'Employee code of type integer greater than 0 is required.',
            });
        });

        it('should return error if employee code is not a number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    employeeCode: '1-23',
                    pricePerTurnInCents: 10,
                },
                token,
                code: 422,
                expectedError: 'Employee code of type integer greater than 0 is required.',
            });
        });

        it('should return error if employee code is not an integer', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    employeeCode: 1.23,
                    pricePerTurnInCents: 10,
                },
                token,
                code: 422,
                expectedError: 'Employee code of type integer greater than 0 is required.',
            });
        });

        it('should return error if employee code is less than 1', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    employeeCode: 0,
                    pricePerTurnInCents: 10,
                },
                token,
                code: 422,
                expectedError: 'Employee code of type integer greater than 0 is required.',
            });

            it('should return error if team member is not checked in', async () => {
                await TeamMemberCheckIn.query().where({ id: teamMemberCheckIn.id }).patch({
                    isCheckedIn: false,
                });

                await assertPostResponseError({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        employeeCode: teamMember.employeeCode,
                        pricePerTurnInCents: 10,
                    },
                    token,
                    code: 500,
                    expectedError: 'Please check-in to continue.',
                });
            });
        });
    });

    describe('business-owner tests', () => {
        let token, user, business, store, machine, device;

        beforeEach(async () => {
            user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            machine = await createMachineWithType('WASHER', store.id);
            device = await createDevice(store.businessId, store.id, { name: 'SP200' });
            token = generateToken({
                id: user.id,
            });
        });

        it('should return error if store does not exist', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.BUSINESS_MANAGER),
                body: {
                    storeId: -1,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                },
                token,
                code: 404,
                expectedError: 'Store not found.',
            });
        });

        it('should pass validation', async () => {
            await assertPostResponseSuccess({
                url: getApiEndpoint(machine.id, origins.BUSINESS_MANAGER),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                },
                token,
            });
        });
    });

    describe('general tests', () => {
        let token, store, machine, device, teamMember;

        beforeEach(async () => {
            store = await factory.create(FACTORIES_NAMES.store);
            await makeRequiredEmployeeCode(store.businessId);

            machine = await createMachineWithType('WASHER', store.id);
            device = await createDevice(store.businessId, store.id, { name: 'SP300' });
            ({ teamMember } = await createCheckedInMember(store.businessId, store.id));
            token = generateToken({
                id: store.id,
            });
        });

        it('should return error if store id is not provided', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Store id of type integer is required.',
            });
        });

        it('should return error if store id is not a number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: 'id1',
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Store id of type integer is required.',
            });
        });

        it('should return error if store id is not an integer', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: 1.23,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Store id of type integer is required.',
            });
        });

        it('should return error if device id is not provided', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Device id of type integer is required.',
            });
        });

        it('should return error if device id is not a number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: 'id2',
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Device id of type integer is required.',
            });
        });

        it('should return error if device id is not an integer', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: 2.2,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Device id of type integer is required.',
            });
        });

        it('should return error if pricePerTurnInCents is not a number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: '15cents',
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Price per turn of type integer is required.',
            });
        });

        it('should return error if pricePerTurnInCents is not an integer', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 0.15,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Price per turn of type integer is required.',
            });
        });

        it('should return error if pricePerTurnInCents is a negative number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: -1,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Price per turn of type integer is required.',
            });
        });

        it('should return error if turnTime is not a number', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    turnTime: '2s',
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Turn time in minutes  is required.',
            });
        });

        it('should return error if turnTime is not an integer', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    turnTime: 2.5,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 422,
                expectedError: 'Turn time in minutes  is required.',
            });
        });

        it('should return error if device is not found', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: -1,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 404,
                expectedError: 'Device not found for the store.',
            });
        });

        it('should return error if device is offline', async () => {
            await Device.query().where({ id: device.id }).patch({
                status: deviceStatuses.OFFLINE,
            });

            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 409,
                expectedError: 'Can not pair device and machine as device is offline.',
            });
        });

        it('should return error if machine is not found', async () => {
            await assertPostResponseError({
                url: getApiEndpoint(-1, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 404,
                expectedError: 'Machine not found for the store.',
            });
        });

        it('should return error if device is already paired', async () => {
            await factory.create(FACTORIES_NAMES.pairing, {
                deviceId: device.id,
            });

            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 409,
                expectedError: 'Device is already paired.',
            });
        });

        it('should return error if machine is already paired', async () => {
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
            });

            await assertPostResponseError({
                url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                body: {
                    storeId: store.id,
                    deviceId: device.id,
                    pricePerTurnInCents: 10,
                    employeeCode: teamMember.employeeCode,
                },
                token,
                code: 409,
                expectedError: 'Machine is already paired.',
            });
        });

        describe('test washer', () => {
            it('should return error if price per turn is empty', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                    code: 422,
                    expectedError: 'Price per turn is required for a washer.',
                });
            });

            it('should return error if turn time is provided', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        pricePerTurnInCents: 10,
                        turnTime: 15,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                    code: 422,
                    expectedError: 'Turn time is not allowed for a washer.',
                });
            });

            it('should pass validation', async () => {
                await assertPostResponseSuccess({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        pricePerTurnInCents: 10,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                });
            });
        });

        describe('test dryer', () => {
            beforeEach(async () => {
                machine = await createMachineWithType('DRYER', store.id);
            });

            it('should return error if turn time is empty', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        pricePerTurnInCents: 25,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                    code: 422,
                    expectedError: 'Turn time is required for a dryer.',
                });
            });

            it('should return error if price per turn is not equal 25', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        turnTime: 2,
                        pricePerTurnInCents: 24,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                    code: 422,
                    expectedError: 'Price per turn for a dryer should be 25 cents.',
                });
            });

            it('should pass validation', async () => {
                await assertPostResponseSuccess({
                    url: getApiEndpoint(machine.id, origins.EMPLOYEE_APP),
                    body: {
                        storeId: store.id,
                        deviceId: device.id,
                        turnTime: 2,
                        pricePerTurnInCents: 25,
                        employeeCode: teamMember.employeeCode,
                    },
                    token,
                });
            });
        });
    });
});

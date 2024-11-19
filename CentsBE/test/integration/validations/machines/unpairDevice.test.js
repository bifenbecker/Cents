require('../../../testHelper');
const factory = require('../../../factories');
const {
    validateBusinessValidation,
    verifyTeamMember,
} = require('../../../../validations/machines/unpairDevice');
const { expect } = require('../../../support/chaiHelper');
const BusinessSettings = require('../../../../models/businessSettings');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { deviceStatuses } = require('../../../../constants/constants');
const { generateToken } = require('../../../support/apiTestHelper');
const Pairing = require('../../../../models/pairing');
const Device = require('../../../../models/device');

const getApiEndpoint = (id) => `/api/v1/business-owner/machine/${id}/un-pair`;
const getEmployeeTabApiEndpoint = (id) => `/api/v1/employee-tab/machines/${id}/un-pair`;

describe('test unpairDevice validation', () => {
    describe('test verifyTeamMember validation', () => {
        it('should return null for default business settings', async () => {
            const req = {
                currentStore: { settings: {} },
            };

            const result = await verifyTeamMember(req, 1);
            expect(result).to.be.null;
        });

        it('should return user id', async () => {
            const business = await factory.create('laundromatBusiness'),
                businessSetting = (
                    await BusinessSettings.query()
                        .patch({
                            requiresEmployeeCode: true,
                        })
                        .where({
                            businessId: business.id,
                        })
                        .returning('*')
                )[0],
                store = await factory.create('store', {
                    businessId: business.id,
                }),
                teamMember = await factory.create('teamMember', {
                    businessId: business.id,
                });

            store.settings = businessSetting;

            await factory.create('teamMemberStore', {
                teamMemberId: teamMember.id,
                storeId: store.id,
            });
            await factory.create('teamMemberCheckIn', {
                teamMemberId: teamMember.id,
                storeId: store.id,
                isCheckedIn: true,
            });

            const req = {
                currentStore: store,
                body: {
                    employeeCode: teamMember.employeeCode,
                },
            };

            const result = await verifyTeamMember(req, business.id);

            expect(result).to.equal(teamMember.userId);
        });
    });

    describe('test validateBusinessValidation', () => {
        it('should return data for business manager source', async () => {
            const user = await factory.create('userWithBusinessOwnerRole');
            user.role = 'Business Owner';
            const business = await factory.create('laundromatBusiness', {
                    userId: user.id,
                }),
                origin = 'BUSINESS_MANAGER',
                req = {
                    currentUser: user,
                };

            const result = await validateBusinessValidation(req, origin);

            expect(result.userId).to.equal(req.currentUser.id);
            expect(result.businessId).to.equal(business.id);
        });

        it('should return data for business employee tab source', async () => {
            const business = await factory.create('laundromatBusiness'),
                businessSetting = (
                    await BusinessSettings.query()
                        .patch({
                            requiresEmployeeCode: true,
                        })
                        .where({
                            businessId: business.id,
                        })
                        .returning('*')
                )[0],
                store = await factory.create('store', {
                    businessId: business.id,
                }),
                teamMember = await factory.create('teamMember', {
                    businessId: business.id,
                });

            store.settings = businessSetting;

            await factory.create('teamMemberStore', {
                teamMemberId: teamMember.id,
                storeId: store.id,
            });
            await factory.create('teamMemberCheckIn', {
                teamMemberId: teamMember.id,
                storeId: store.id,
                isCheckedIn: true,
            });

            const origin = 'EMPLOYEE_TAB',
                req = {
                    currentStore: store,
                    body: {
                        employeeCode: teamMember.employeeCode,
                    },
                };

            const result = await validateBusinessValidation(req, origin);

            expect(result.userId).to.equal(teamMember.userId);
            expect(result.businessId).to.equal(req.currentStore.businessId);
        });

        it('should reject if business was not found', async () => {
            const business = await factory.create('laundromatBusiness'),
                store = await factory.create('store', {
                    businessId: business.id,
                });

            store.businessId = null;
            store.settings = {};

            const origin = 'EMPLOYEE_TAB',
                req = {
                    currentStore: store,
                };

            await expect(validateBusinessValidation(req, origin)).to.be.rejectedWith(
                'business not found',
            );
        });
    });

    describe('test unpairDeviceValidation', () => {
        let token, user, business, store, machine, batch, device, pairing;

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
            device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
                batchId: batch.id,
                name: 'AB100',
                isPaired: true,
            });
            pairing = await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
            });
        });

        describe('general', () => {
            beforeEach(() => {
                token = generateToken({
                    id: user.id,
                });
            });
            it('should pass validation', async () => {
                await assertPostResponseSuccess({
                    url: getApiEndpoint(machine.id),
                    token,
                });
            });
            it('should fail if machine id is not a number', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint('id1'),
                    token,
                    code: 500,
                    expectedError: '"machineId" must be a number',
                });
            });
            it('should fail if machine id is less than 1', async () => {
                await assertPostResponseError({
                    url: getApiEndpoint(0),
                    token,
                    code: 500,
                    expectedError: '"machineId" must be larger than or equal to 1',
                });
            });

            it('should fail if machine is already unpaired', async () => {
                await Pairing.query().patch({
                    deletedAt: new Date(),
                });
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id),
                    token,
                    code: 500,
                    expectedError: '[MachinePairingError] Machine is already un paired',
                });
            });
            it('should fail if device is in use', async () => {
                await Device.query().findById(device.id).patch({
                    status: deviceStatuses.IN_USE,
                });
                await assertPostResponseError({
                    url: getApiEndpoint(machine.id),
                    token,
                    code: 500,
                    expectedError: '[DeviceInUseError] Device selected to unpair is in-use',
                });
            });
        });

        describe('specific to employee tab', () => {
            beforeEach(async () => {
                await BusinessSettings.query()
                    .patch({
                        requiresEmployeeCode: true,
                    })
                    .where({
                        businessId: business.id,
                    });

                token = generateToken({
                    id: store.id,
                });
            });

            it('should fail if employee code is empty', async () => {
                await assertPostResponseError({
                    url: getEmployeeTabApiEndpoint(machine.id),
                    token,
                    code: 500,
                    expectedError: '"employeeCode" is required',
                });
            });

            it('should fail if employee code is not a number', async () => {
                await assertPostResponseError({
                    url: getEmployeeTabApiEndpoint(machine.id),
                    token,
                    body: {
                        employeeCode: '1-2-3',
                    },
                    code: 500,
                    expectedError: '"employeeCode" must be a number',
                });
            });

            it('should fail if employee code is less than 1', async () => {
                await assertPostResponseError({
                    url: getEmployeeTabApiEndpoint(machine.id),
                    token,
                    body: {
                        employeeCode: 0,
                    },
                    code: 500,
                    expectedError: '"employeeCode" must be larger than or equal to 1',
                });
            });

            it('should fail if team member with employee code does not exist', async () => {
                await assertPostResponseError({
                    url: getEmployeeTabApiEndpoint(machine.id),
                    token,
                    body: {
                        employeeCode: 123,
                    },
                    code: 500,
                    expectedError: 'Invalid employee code',
                });
            });

            it('should fail if team member is not checked in', async () => {
                const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
                    userId: user.id,
                    businessId: business.id,
                });

                await assertPostResponseError({
                    url: getEmployeeTabApiEndpoint(machine.id),
                    token,
                    body: {
                        employeeCode: teamMember.employeeCode,
                    },
                    code: 500,
                });
            });
        });
    });
});

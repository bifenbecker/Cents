require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertPostResponseSuccess,
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { deviceStatuses, MACHINE_TYPES } = require('../../../../constants/constants');
const {
    mockMachineFeatureConfig,
    mockMachineModelConfig,
    mockMachineProgrammingWasherConfig
} = require('../../../support/machineConfiguartionsHelper');
const MachineModel = require('../../../../models/machineModel');
const Pairing = require('../../../../models/pairing');
const Device = require('../../../../models/device');
const MachinePricing = require('../../../../models/machinePricing');

const getAPIEndpoint = (deviceId) => `/api/v1/business-owner/machine/devices/${deviceId}/create-machine`;

describe('test createMachineByDevice api', () => {
    let user, business, store, batch, device, token, configurations;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            storeId: store.id,
            businessId: business.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            batchId: batch.id,
            isActive: true,
            isPaired: false,
            status: deviceStatuses.ONLINE,
            name: '66:cc:88:dd'
        });
        token = generateToken({
            id: user.id,
        });
        await factory.create(FACTORIES_NAMES.machineTypeWasher);
        await factory.create(FACTORIES_NAMES.machineTypeDryer);
    });

    describe('when authorization is failed', function () {
        itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => getAPIEndpoint(device.id));

        it('should throw an error if user does not exist', async () => {
            await assertPostResponseError({
                url: getAPIEndpoint(device.id),
                token: generateToken({
                    id: -1,
                }),
                code: 403,
                expectedError: 'User not found',
            });
        });

        it('should throw an error if user does not have a valid role', async () => {
            user = await factory.create('user');
            await assertPostResponseError({
                url: getAPIEndpoint(device.id),
                token: generateToken({
                    id: user.id,
                }),
                code: 403,
                expectedError: 'Unauthorized',
            });
        });
    });

    describe('when device is wrong', () => {
        it('should respond 404 if the device does not exist', async () => {
            await assertPostResponseError({
                url: getAPIEndpoint(563875),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 404,
            });
        });

        it('should respond 400 if the device is offline', async () => {
            const deviceWrong = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: false,
                status: deviceStatuses.OFFLINE,
                name: '00:cc:88:ii'
            });
            await assertPostResponseError({
                url: getAPIEndpoint(deviceWrong.id),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 400,
            });
        });

        it('should respond 400 if the device is with empty name', async () => {
            const deviceWrong = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: false,
                status: deviceStatuses.ONLINE,
                name: null
            });
            await assertPostResponseError({
                url: getAPIEndpoint(deviceWrong.id),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 400,
            });
        });

        it('should respond 409 if the device is already paired', async () => {
            const deviceWrong = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
                name: '22:cc:88:jj'
            });
            await assertPostResponseError({
                url: getAPIEndpoint(deviceWrong.id),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 409,
            });
        });
    });

    describe('when business is wrong', () => {
        it('should respond 403 response when the device does not belong to the business', async () => {
            const userNew = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            const businessNew = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: userNew.id });
            const storeNew = await factory.create(FACTORIES_NAMES.store, {
                businessId: businessNew.id,
            });
            await factory.create(FACTORIES_NAMES.batch, {
                storeId: storeNew.id,
                businessId: businessNew.id,
            });
            await assertPostResponseError({
                url: getAPIEndpoint(device.id),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: userNew.id,
                }),
                code: 403,
            });
        });
    });

    describe('when configurations is wrong', () => {
        it('should respond 404 if the configurations is not stored', async () => {
            await assertPostResponseError({
                url: getAPIEndpoint(device.id),
                body: {
                    name: 'Aurora'
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 404,
            });
        });
    });

    describe('when machine name is wrong', () => {
        it('should respond 409 if a machine with such a name already exists in the store', async () => {
            const machineName = 'Aurora'
            await factory.create(FACTORIES_NAMES.machine, {
                name: machineName,
                storeId: store.id,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            await assertPostResponseError({
                url: getAPIEndpoint(device.id),
                body: {
                    name: machineName
                },
                token: generateToken({
                    id: user.id,
                }),
                code: 409,
            });
        });
    });

    describe('when networked machine is created', () => {
        it('should return status 201 and created machine', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            await assertPostResponseSuccess({
                url: getAPIEndpoint(device.id),
                token,
                body: {
                    name: 'Afrodita',
                },
                code: 201,
            });
        });

        it('should create a washer machine', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const { body } = await assertPostResponseSuccess({
                url: getAPIEndpoint(device.id),
                token,
                body: {
                    name: 'Afrodita',
                },
                code: 201,
            });

            expect(body).to.have.property('success').to.be.eql(true);
            expect(body).to.have.property('machine').to.be.an('object');
            expect(body.machine).to.have.property('id').to.be.a('number');
            expect(body.machine).to.have.property('storeId').to.be.a('number');
            expect(body.machine).to.have.property('modelId').to.be.a('number');
            expect(body.machine).to.have.property('name').to.be.a('string');
            expect(body.machine).to.have.property('serialNumber').to.be.a('string');
            expect(body.machine).to.have.property('isActive').to.be.a('boolean');
            expect(body.machine).to.have.property('origin').to.be.a('string');
            expect(body.machine).to.have.property('turnTimeInMinutes').to.be.null;

            const machineModelExpected = await MachineModel.query().findById(body.machine.modelId).withGraphJoined('[machineType]');

            expect(machineModelExpected?.machineType).to.have.property('name').to.eql(MACHINE_TYPES.WASHER);
        });

        it('should create a dryer machine', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({
                    PennyID: device.name,
                    LaundryMachineModel: {
                        Model: 'ACA h7 Topload',
                        Washer_enable: '0',
                        CycleTime: '300',
                    }
                }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const { body } = await assertPostResponseSuccess({
                url: getAPIEndpoint(device.id),
                token,
                body: {
                    name: 'Afrodita',
                },
                code: 201,
            });

            expect(body).to.have.property('success').to.be.eql(true);
            expect(body).to.have.property('machine').to.be.an('object');
            expect(body.machine).to.have.property('id').to.be.a('number');
            expect(body.machine).to.have.property('storeId').to.be.a('number');
            expect(body.machine).to.have.property('modelId').to.be.a('number');
            expect(body.machine).to.have.property('name').to.be.a('string');
            expect(body.machine).to.have.property('serialNumber').to.be.a('string');
            expect(body.machine).to.have.property('isActive').to.be.a('boolean');
            expect(body.machine).to.have.property('origin').to.be.a('string');
            expect(body.machine).to.have.property('turnTimeInMinutes').to.be.a('number');

            const machineModelExpected = await MachineModel.query().findById(body.machine.modelId).withGraphJoined('[machineType]');

            expect(machineModelExpected?.machineType).to.have.property('name').to.eql(MACHINE_TYPES.DRYER);
        });

        it('should pair the device with the created machine', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const { body } = await assertPostResponseSuccess({
                url: getAPIEndpoint(device.id),
                token,
                body: {
                    name: 'Afrodita',
                },
                code: 201,
            });

            const pairingExpected = await Pairing.query().findOne({
                deviceId: device.id,
                machineId: body.machine.id,
            });
            const deviceUpdated = await Device.query().findById(device.id);

            expect(pairingExpected).not.to.be.undefined;
            expect(pairingExpected).to.have.property('pairedByUserId').to.eql(user.id);
            expect(deviceUpdated).to.have.property('isPaired').to.eql(true);
        });

        it('should create machinePricings for the created machine', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const { body } = await assertPostResponseSuccess({
                url: getAPIEndpoint(device.id),
                token,
                body: {
                    name: 'Afrodita',
                },
                code: 201,
            });

            const machinePricingsExpected = await MachinePricing.query().where({
                machineId: body.machine.id,
            });

            expect(machinePricingsExpected.length).to.be.greaterThan(0);
        });
    });
});

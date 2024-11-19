require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const validateCreateMachineConfigurationsUow = require('../../../../../uow/machines/createMachineByDevice/validateCreateMachineConfigurationsUow');

describe('createMachineByDevice/validateCreateMachineConfigurationsUow function test', () => {
    let user, business, store, batch, device, configurations;

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
    });

    describe('when device are configurations wrong for creating a machine', () => {
        it('should throw an error if machineFeature config is with leak of Model into LaundryMachineModel data', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({
                    PennyID: device.name,
                    LaundryMachineModel: {
                        Model: null,
                        Washer_enable: '1',
                    }
                }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong Machine feature configurations');
        });

        it('should throw an error if machineFeature config is with leak of Washer_enable into LaundryMachineModel data', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({
                    PennyID: device.name,
                    LaundryMachineModel: {
                        Model: 'ACA H7 Topload',
                        Washer_enable: null,
                    }
                }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong Machine feature configurations');
        });

        it('should throw an error if machineFeature config is wrong for dryers into LaundryMachineModel data', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({
                    PennyID: device.name,
                    LaundryMachineModel: {
                        Model: 'ACA H7 Topload',
                        Washer_enable: '0',
                        CycleTime: null,
                    }
                }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong Machine model configurations for dryer type');
        });

        it('should throw an error if machineModel config with nullable LMSize', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name, }),
                ...mockMachineModelConfig({
                    PennyID: device.name,
                    LMSize: null,
                }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong Machine model configurations');
        });

        it('should throw an error if machineModel config with nullable LMManufacturer', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name, }),
                ...mockMachineModelConfig({
                    PennyID: device.name,
                    LMManufacturer: null,
                }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong Machine model configurations');
        });

        it('should throw an error if machineProgramming config with nullable BaseCyclePrices into MachineVendPrices', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        BaseCyclePrices: null,
                    }
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(validateCreateMachineConfigurationsUow(payloadMock)).to.be.rejectedWith('Wrong machine programming configurations');
        });
    });

    describe('when validation passed successfully', () => {
        it('should return initial payload', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            const result = await validateCreateMachineConfigurationsUow(payloadMock);
            expect(result).to.deep.equal(payloadMock);
        });

    });
});

require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const MachineModel = require('../../../../../models/machineModel');
const MachineType = require('../../../../../models/machineType');
const createMachineModelUow = require('../../../../../uow/machines/createMachineByDevice/createMachineModelUow');

describe('createMachineByDevice/createMachineModelUow function test', () => {
    let user, business, store, batch, device, machineType, configurations;

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

        machineType = await factory.create(FACTORIES_NAMES.machineTypeWasher);
    });

    describe('when machine type is not found', () => {
        it('should throw an error if machineType is not found', async () => {
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
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            await expect(createMachineModelUow(payloadMock)).to.be.rejectedWith('Needed machine type is not found');
        });
    });

    describe('when machine type exists', () => {
        it('should attach created machineModel and machineType to returning payload', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = { configurations: mapAllConfigurations(configurations) };

            const result = await createMachineModelUow(payloadMock);

            const machineModelExpected = await MachineModel.query().orderBy('id', 'desc').first();
            const machineTypeExpected = await MachineType.query().findById(machineType.id);

            expect(result).to.deep.equal({
                ...payloadMock,
                machineModel: machineModelExpected,
                machineType: machineTypeExpected,
            });
        });
    });
});

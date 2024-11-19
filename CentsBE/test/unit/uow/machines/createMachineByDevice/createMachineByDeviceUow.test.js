require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect, chai } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses, origins } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const Machine = require('../../../../../models/machine');
const createMachineByDeviceUow = require('../../../../../uow/machines/createMachineByDevice/createMachineByDeviceUow');

describe('createMachineByDevice/createMachineByDeviceUow function test', () => {
    let user, business, store, batch, device, machineType, machineModel, configurations;

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

    describe('when a machine with such a name already exists', () => {
        it('should create a machine if existed one is in another store', async () => {
            const machineName = 'Afrodita';
            const storeSecond = await factory.create(FACTORIES_NAMES.store);
            await factory.create(FACTORIES_NAMES.machine, {
                name: machineName,
                storeId: storeSecond.id,
            });

            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            machineType = await factory.create(FACTORIES_NAMES.machineTypeWasher);
            machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                typeId: machineType.id,
            });

            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                device: {
                    ...device,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machineType,
                machineModel,
                machineName,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await createMachineByDeviceUow(payloadMock, spyErrorHandler);

            const machineExpected = await Machine.query().orderBy('id', 'desc').first();

            expect(result).to.deep.equal({
                ...payloadMock,
                machine: machineExpected,
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });

        it('should throw and error if a machine with the same name in the same store already exists', async () => {
            const machineName = 'Afrodita';
            await factory.create(FACTORIES_NAMES.machine, {
                storeId: store.id,
                name: machineName,
            });

            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            machineType = await factory.create(FACTORIES_NAMES.machineTypeWasher);
            machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                typeId: machineType.id,
            });

            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                device: {
                    ...device,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machineType,
                machineModel,
                machineName,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(createMachineByDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Machine with such name already exist in the store');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when create machine', () => {
        it('should attach created machine with nullable turnTimeInMinutes to returning payload for washers', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            machineType = await factory.create(FACTORIES_NAMES.machineTypeWasher);
            machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                typeId: machineType.id,
            });
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                device: {
                    ...device,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machineType,
                machineModel,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await createMachineByDeviceUow(payloadMock);

            const machineExpected = await Machine.query().orderBy('id', 'desc').first();

            expect(result).to.deep.equal({
                ...payloadMock,
                machine: machineExpected,
            });
            expect(machineExpected).to.have.property('turnTimeInMinutes').to.be.null;
            expect(spyErrorHandler).not.to.have.been.called();
        });

        it('should attach created machine with not nullable turnTimeInMinutes to returning payload for dryers', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    LaundryMachineModel: {
                        Model: "ACA h7 Topload",
                        Washer_enable: "1",
                        CycleTime: "300",
                    }
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            machineType = await factory.create(FACTORIES_NAMES.machineTypeDryer);
            machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                typeId: machineType.id,
            });
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                device: {
                    ...device,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machineType,
                machineModel,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await createMachineByDeviceUow(payloadMock);


            const { LaundryMachineModel: laundryMachineModel }= configurations;
            const turnTimeInMinutesExpected = Math.trunc(Number(laundryMachineModel.CycleTime) / 60);
            const machineExpected = await Machine.query().orderBy('id', 'desc').first();

            expect(result).to.deep.equal({
                ...payloadMock,
                machine: machineExpected,
            });
            expect(machineExpected).to.have.property('turnTimeInMinutes').to.be.eql(turnTimeInMinutesExpected);
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});

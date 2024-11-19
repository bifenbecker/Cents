require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect, chai } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses, origins } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const Machine = require('../../../../../models/machine');
const updateMachineByDeviceUow = require('../../../../../uow/machines/createNetworkedMachineByOffline/updateMachineByDeviceUow');

describe('createNetworkedMachineByOffline/updateMachineByDeviceUow function test', () => {
    let user, business, store, batch, device, machineType, machineModel, machine, configurations;

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
        machine = await factory.create(FACTORIES_NAMES.machineWasher, {
            storeId: store.id,
        });
    });

    describe('when machine does not exist, paired or the name is duplicated', () => {
        it('should throw an error if a machine does not exist', async () => {
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
                machineId: 5637468,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(updateMachineByDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Machine does not exist');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if the machine already paired with different device', async () => {
            const machinePaired = await factory.create(FACTORIES_NAMES.machine, {
                storeId: store.id,
            });
            const devicePaired = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
                name: '46:ii:88:jj'
            });
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machinePaired.id,
                deviceId: devicePaired.id,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: devicePaired.name }),
                ...mockMachineModelConfig({ PennyID: devicePaired.name }),
                ...mockMachineProgrammingWasherConfig({ PennyID: devicePaired.name }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            machineType = await factory.create(FACTORIES_NAMES.machineTypeWasher);
            machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                typeId: machineType.id,
            });
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                device: {
                    ...devicePaired,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machineType,
                machineModel,
                machineId: machinePaired.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(updateMachineByDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Machine is already paired');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if a with the same name exists', async () => {
            await factory.create(FACTORIES_NAMES.machine, {
                name: 'afroDitA',
                storeId: store.id,
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
                machineId: machine.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(updateMachineByDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Machine with such name already exist in the store');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when update machine', () => {
        it('should attach machine with the same id', async () => {
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
                machineId: machine.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await updateMachineByDeviceUow(payloadMock);

            expect(result).to.have.property('machine').to.have.property('id').to.eql(machine.id);
            expect(spyErrorHandler).not.to.have.been.called();
        });

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
                machineId: machine.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await updateMachineByDeviceUow(payloadMock);

            const machineExpected = await Machine.query().findById(machine.id);

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
                machineId: machine.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await updateMachineByDeviceUow(payloadMock);

            const { LaundryMachineModel: laundryMachineModel } = configurations;
            const turnTimeInMinutesExpected = Math.trunc(Number(laundryMachineModel.CycleTime) / 60);
            const machineExpected = await Machine.query().findById(machine.id);

            expect(result).to.deep.equal({
                ...payloadMock,
                machine: machineExpected,
            });
            expect(machineExpected).to.have.property('turnTimeInMinutes').to.be.eql(turnTimeInMinutesExpected);
            expect(spyErrorHandler).not.to.have.been.called();
        });

        it('should create a machine if it had paring deleted', async () => {
            await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
                deletedAt: new Date().toDateString(),
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
                machineId: machine.id,
                machineName: 'Afrodita',
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await updateMachineByDeviceUow(payloadMock);

            const machineExpected = await Machine.query().findById(machine.id);

            expect(result).to.deep.equal({
                ...payloadMock,
                machine: machineExpected,
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});

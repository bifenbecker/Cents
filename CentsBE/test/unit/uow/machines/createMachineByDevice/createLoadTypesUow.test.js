require('../../../../testHelper');

const { sortBy } = require('lodash');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const MachineLoadType = require('../../../../../models/machineLoad');
const createLoadTypesUow = require('../../../../../uow/machines/createMachineByDevice/createLoadTypesUow');

describe('createMachineByDevice/createLoadTypesUow function test', () => {
    let user, business, store, batch, device, configurations, loadTypeNormalCold, loadTypeNormalWarn, loadTypeNormalHot;
    const loadTypesMock = {
        normalCold: 'Normal Cold',
        normalWarm: 'Normal Warm',
        normalHot: 'Normal Hot',
    };

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

    describe('when we already have all the load types stored earlier', () => {
        it('should attach existing machineLoadTypes to returning payload, should not create new ones', async () => {
            loadTypeNormalHot = await factory.create(FACTORIES_NAMES.machineLoadType, {
                name: loadTypesMock.normalHot,
            });
            loadTypeNormalWarn = await factory.create(FACTORIES_NAMES.machineLoadType, {
                name: loadTypesMock.normalWarm,
            });
            loadTypeNormalCold = await factory.create(FACTORIES_NAMES.machineLoadType, {
                name: loadTypesMock.normalCold,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        BaseCyclePrices: {
                            [loadTypesMock.normalCold]: '0.25',
                            [loadTypesMock.normalWarm]: '0.50',
                            [loadTypesMock.normalHot]: '0.75',
                        },
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
            };


            const { count: loadTypesBeforeCreateCount } = await MachineLoadType.query().count();
            const result = await createLoadTypesUow(payloadMock);
            const machineLoadTypesSorted = sortBy(result.machineLoadTypes, 'id');
            const { count: loadTypesAfterCreateCount } = await MachineLoadType.query().count();

            const machineLoadTypesExpected = await MachineLoadType.query().findByIds([loadTypeNormalHot.id, loadTypeNormalWarn.id, loadTypeNormalCold.id]).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            result.machineLoadTypes = machineLoadTypesSorted;
            expect(result.machineLoadTypes).to.be.deep.equal(machineLoadTypesExpected);
            expect(loadTypesBeforeCreateCount).to.be.eql(loadTypesAfterCreateCount);
        });

        it('should attach new created with matched in config machineLoadTypes to returning payload', async () => {
            loadTypeNormalCold = await factory.create(FACTORIES_NAMES.machineLoadType, {
                name: loadTypesMock.normalCold,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        BaseCyclePrices: {
                            [loadTypesMock.normalCold]: '0.25',
                            [loadTypesMock.normalWarm]: '0.50',
                            [loadTypesMock.normalHot]: '0.75',
                        },
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
            };

            const machineLoadTypesBefore = await MachineLoadType.query().whereIn('name', Object.values(loadTypesMock)).orderBy('id', 'asc');
            const result = await createLoadTypesUow(payloadMock);
            const machineLoadTypesSorted = sortBy(result.machineLoadTypes, 'id');
            const machineLoadTypesAfter = await MachineLoadType.query().whereIn('name', Object.values(loadTypesMock)).orderBy('id', 'asc');

            const machineLoadTypesExpected = await MachineLoadType.query().whereIn('name', Object.values(loadTypesMock)).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            result.machineLoadTypes = machineLoadTypesSorted;
            expect(result.machineLoadTypes).to.be.deep.equal(machineLoadTypesExpected);
            expect(machineLoadTypesBefore.length).to.be.eql(1);
            expect(machineLoadTypesAfter.length).to.be.eql(3);
        });
    });
});

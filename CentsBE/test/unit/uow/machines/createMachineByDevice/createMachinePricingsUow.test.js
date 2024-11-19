require('../../../../testHelper');

const { sortBy } = require('lodash');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const MachinePricing = require('../../../../../models/machinePricing');
const MachineModelLoad = require('../../../../../models/machineModelLoad');
const MachineModelModifier = require('../../../../../models/machineModelModifier');

const createMachinePricingsUow = require('../../../../../uow/machines/createMachineByDevice/createMachinePricingsUow');

const {
    mockMachineFeatureConfig,
    mockMachineModelConfig,
    mockMachineProgrammingWasherConfig
} = require('../../../../support/machineConfiguartionsHelper');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');

describe('createMachineByDevice/createMachinePricingsUow function test', () => {
    let user, business, store, batch, device, machineLoadTypes = [], machineModel, machineModelLoads, machineModifierTypes = [], machineModelModifiers, machine, configurations;

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
        machineModel = await factory.create(FACTORIES_NAMES.machineModel);
        machine = await factory.create(FACTORIES_NAMES.machine, {
            modelId: machineModel.id,
        });
    });

    describe('when creates machine pricings', () => {
        it('should attach created machinePricings to the returning payload', async () => {
            const loadTypesMock = {
                normalCold: 'Normal Cold',
                normalWarm: 'Normal Warm',
                normalHot: 'Normal Hot',
            };
            const machineModifierTypesMock = {
                light: 'Light',
                medium: 'Medium',
                heavy: 'Heavy',
            };
            for (const loadType of Object.values(loadTypesMock)) {
                const machineLoadType = await factory.create(FACTORIES_NAMES.machineLoadType, {
                    name: loadType,
                });
                machineLoadTypes.push(machineLoadType);
            }
            for (const modifierType of Object.values(machineModifierTypesMock)) {
                const machineModifierType = await factory.create(FACTORIES_NAMES.machineModifierType, {
                    name: modifierType,
                });
                machineModifierTypes.push(machineModifierType);
            }
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
                        ModifierCyclePrices: {
                            [machineModifierTypesMock.light]: '0.25',
                            [machineModifierTypesMock.medium]: '0.50',
                            [machineModifierTypesMock.heavy]: '0.75',
                        },
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const machineModelLoadsDto = machineLoadTypes.map((loadType) => ({
                modelId: machineModel.id,
                loadId: loadType.id,
            }));
            machineModelLoads = await MachineModelLoad.query().insertAndFetch(
                machineModelLoadsDto,
            );
            const machineModelModifiersDto = machineModifierTypes.map((modifierType) => ({
                modelId: machineModel.id,
                machineModifierTypeId: modifierType.id,
            }));
            machineModelModifiers = await MachineModelModifier.query().insertAndFetch(
                machineModelModifiersDto,
            );

            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
                machineLoadTypes,
                machineModelLoads,
                machineModifierTypes,
                machineModelModifiers,
                machine,
            };

            const result = await createMachinePricingsUow(payloadMock);
            const machinePricingSorted = sortBy(result.machinePricings, 'id');
            const machinePricingExpected = await MachinePricing.query().where({
                machineId: machine.id,
            }).orderBy('id', 'asc');

            expect(result).includes(payloadMock);
            expect(machinePricingSorted).deep.equal(machinePricingExpected);
        });
    });
});

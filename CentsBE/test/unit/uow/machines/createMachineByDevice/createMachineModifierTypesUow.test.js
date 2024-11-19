require('../../../../testHelper');

const { sortBy } = require('lodash');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const { mapAllConfigurations } = require('../../../../../services/machines/devicesResponseMappers');
const MachineModifierType = require('../../../../../models/machineModifierType');
const createMachineModifierTypesUow = require('../../../../../uow/machines/createMachineByDevice/createMachineModifierTypesUow');

describe('createMachineByDevice/createMachineModifierTypesUow function test', () => {
    let user, business, store, batch, device, configurations, machineModifierTypeLight, machineModifierTypeMedium, machineModifierTypeHeavy;
    const machineModifierTypesMock = {
        light: 'Light',
        medium: 'Medium',
        heavy: 'Heavy',
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

    describe('when we already have ModifierCyclePrices passed to params', () => {
        it('should attach existing machineModifierTypes to returning payload, should not create new ones', async () => {
            machineModifierTypeLight = await factory.create(FACTORIES_NAMES.machineModifierType, {
                name: machineModifierTypesMock.light,
            });
            machineModifierTypeMedium = await factory.create(FACTORIES_NAMES.machineModifierType, {
                name: machineModifierTypesMock.medium,
            });
            machineModifierTypeHeavy = await factory.create(FACTORIES_NAMES.machineModifierType, {
                name: machineModifierTypesMock.heavy,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        ModifierCyclePrices: {
                            [machineModifierTypesMock.light]: '0.25',
                            [machineModifierTypesMock.medium]: '0.50',
                            [machineModifierTypesMock.heavy]: '0.75',
                        },
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);

            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
            };


            const { count: modifierTypesBeforeCreateCount } = await MachineModifierType.query().count();
            const result = await createMachineModifierTypesUow(payloadMock);
            const machineModifierTypesSorted = sortBy(result.machineModifierTypes, 'id');
            const { count: modifierTypesAfterCreateCount } = await MachineModifierType.query().count();

            const machineModifierTypesExpected = await MachineModifierType.query().findByIds([machineModifierTypeLight.id, machineModifierTypeMedium.id, machineModifierTypeHeavy.id]).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            result.machineModifierTypes = machineModifierTypesSorted;
            expect(result.machineModifierTypes).to.be.deep.equal(machineModifierTypesExpected);
            expect(modifierTypesBeforeCreateCount).to.be.eql(modifierTypesAfterCreateCount);
        });

        it('should attach new created with matched in config machineModifierTypes to returning payload', async () => {
            machineModifierTypeLight = await factory.create(FACTORIES_NAMES.machineModifierType, {
                name: machineModifierTypesMock.light,
            });
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        ModifierCyclePrices: {
                            [machineModifierTypesMock.light]: '0.25',
                            [machineModifierTypesMock.medium]: '0.50',
                            [machineModifierTypesMock.heavy]: '0.75',
                        },
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
            };

            const machineModifierTypesBefore = await MachineModifierType.query().whereIn('name', Object.values(machineModifierTypesMock)).orderBy('id', 'asc');
            const result = await createMachineModifierTypesUow(payloadMock);
            const machineModifierTypesSorted = sortBy(result.machineModifierTypes, 'id');
            const machineModifierTypesAfter = await MachineModifierType.query().whereIn('name', Object.values(machineModifierTypesMock)).orderBy('id', 'asc');

            const machineModifierTypesExpected = await MachineModifierType.query().whereIn('name', Object.values(machineModifierTypesMock)).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            result.machineModifierTypes = machineModifierTypesSorted;
            expect(result.machineModifierTypes).to.be.deep.equal(machineModifierTypesExpected);
            expect(machineModifierTypesBefore.length).to.be.eql(1);
            expect(machineModifierTypesAfter.length).to.be.eql(3);
        });
    });

    describe('when param ModifierCyclePrices is nullable', () => {
        it('should return initial passed payload with empty array of machineModifierTypes', async () => {
            const mockConfigurationsBody = {
                ...mockMachineFeatureConfig({ PennyID: device.name }),
                ...mockMachineModelConfig({ PennyID: device.name }),
                ...mockMachineProgrammingWasherConfig({
                    PennyID: device.name,
                    MachineVendPrices: {
                        ModifierCyclePrices: null
                    },
                }),
            };
            configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
            const payloadMock = {
                configurations: mapAllConfigurations(configurations),
            };

            const result = await createMachineModifierTypesUow(payloadMock);

            expect(result).to.deep.equal({
                configurations: mapAllConfigurations(configurations),
                machineModifierTypes: [],
            });
        });
    });
});

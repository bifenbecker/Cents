require('../../../../testHelper');

const { sortBy } = require('lodash');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const MachineModelModifier = require('../../../../../models/machineModelModifier');

const createMachineModelModifiersUowTest = require('../../../../../uow/machines/createMachineByDevice/createMachineModelModifiersUow');

describe('createMachineByDevice/createMachineModelModifiersUow function test', () => {
    let user, business, store, batch, device, machineModel, machineModifierTypes;

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
        machineModifierTypes = await factory.createMany(FACTORIES_NAMES.machineModifierType, 5)
    });

    describe('when creates machine model modifiers', () => {
        it('should attach created model loads to the returning payload', async () => {
            const payloadMock = {
                machineModifierTypes: machineModifierTypes,
                machineModel,
            };
            const machineModifierTypesIds = machineModifierTypes.map(({ id }) => id);

            const result = await createMachineModelModifiersUowTest(payloadMock);
            const machineModelModifiersSorted = sortBy(result.machineModelModifiers, 'id');
            const machineModelModifiersExpected = await MachineModelModifier.query().whereIn('machineModifierTypeId', machineModifierTypesIds).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            expect(machineModelModifiersSorted).to.deep.equal(machineModelModifiersExpected)
        });
    });

    describe('when does not create machine model modifiers', () => {
        it('should attach initial payload with empty array of machineModelModifiers', async () => {
            const payloadMock = {
                machineModifierTypes: [],
                machineModel,
            };

            const result = await createMachineModelModifiersUowTest(payloadMock);

            expect(result).to.deep.includes(payloadMock);
            expect(result).to.have.property('machineModelModifiers').to.deep.equal([]);
        });
    });
});

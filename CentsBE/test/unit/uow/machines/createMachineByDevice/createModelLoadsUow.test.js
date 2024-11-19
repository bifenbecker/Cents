require('../../../../testHelper');

const { sortBy } = require('lodash');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const MachineModelLoad = require('../../../../../models/machineModelLoad');

const createModelLoadsUow = require('../../../../../uow/machines/createMachineByDevice/createModelLoadsUow');

describe('createMachineByDevice/createModelLoadsUow function test', () => {
    let user, business, store, batch, device, machineModel, machineLoadTypes;

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
        machineLoadTypes = await factory.createMany(FACTORIES_NAMES.machineLoadType, 5)
    });

    describe('when creates model loads', () => {
        it('should attach created model loads to the returning payload', async () => {
            const payloadMock = {
                machineLoadTypes,
                machineModel,
            };
            const machineLoadTypesIds = machineLoadTypes.map(({ id }) => id);

            const result = await createModelLoadsUow(payloadMock);
            const machineModelLoadsSorted = sortBy(result.machineModelLoads, 'id');
            const machineModelLoadsExpected = await MachineModelLoad.query().whereIn('loadId', machineLoadTypesIds).orderBy('id', 'asc');

            expect(result).to.deep.includes(payloadMock);
            expect(machineModelLoadsSorted).to.deep.equal(machineModelLoadsExpected)
        });
    });
});

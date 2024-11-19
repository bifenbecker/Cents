require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const getMachineSettingsUow = require('../../../../../uow/machines/machinePricesSettings/getMachineSettingsUow');

describe('getMachinePricingSettings/getMachineSettingsUow function test', () => {
    let user, business, store, batch, device, machine, machineModel;

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

    describe('when get machine settings', () => {
        it('should attach coinValues, cycleSettings, additionalSettings', async () => {
            const payloadMock = {
                machineId: machine.id,
            };

            const result = await getMachineSettingsUow(payloadMock);

            // will be finalized once we have info about settings
            expect(result).to.deep.equal({
                ...payloadMock,
                coinValues: [],
                cycleSettings: [],
                additionalSettings: [],
            });
        });
    });
});

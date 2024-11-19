require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { createServiceOrderTurn } = require('../../../support/serviceOrderTestHelper');
const factory = require('../../../factories');
const turnDetails = require('../../../../pipeline/machines/turnDetails');

describe('test getMachineDetailsPipeline', () => {
    let user,
        store,
        storeCustomer,
        turn,
        machine,
        machineType,
        machineModel,
        machinePricings,
        serviceOrder;

    beforeEach(async () => {
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer');
        user = await factory.create('user');
        serviceOrder = await factory.create('serviceOrder', {
            userId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            storeId: store.id,
            userId: user.id,
        });
        machinePricings = await factory.create('machinePricing', { machineId: machine.id });
        device = await factory.create('device');
        ({ turn } = await createServiceOrderTurn(serviceOrder, machine));
    });

    it('should return expected result', async () => {
        const payload = {
            turnId: turn.id,
        };

        const result = await turnDetails(payload);

        expect(result).to.include({
            id: turn.id,
            serviceType: turn.serviceType,
        });
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(turnDetails()).to.be.rejected;
        await expect(turnDetails(null)).to.be.rejected;
        await expect(turnDetails({})).to.be.rejected;
    });
});

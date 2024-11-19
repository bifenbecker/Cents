require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const { createServiceOrderTurn } = require('../../../support/serviceOrderTestHelper');
const getServiceOrderTurnsCountPipeline = require('../../../../pipeline/machines/getServiceOrderTurnsCountPipeline');

describe('test getServiceOrderTurnsCountPipeline', () => {
    let serviceOrder;

    beforeEach(async () => {
        const storeCustomer = await factory.create(FN.storeCustomer);
        const {id: storeCustomerId, storeId} = storeCustomer;

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId,
            storeCustomerId,
        });

        const dryer = await factory.create(FN.machineDryer, { storeId });
        const washer = await factory.create(FN.machineWasher, { storeId });
        await createServiceOrderTurn(serviceOrder, dryer);
        await createServiceOrderTurn(serviceOrder, washer);
    });

    it('it should succesfully get service order turns count', async () => {
        const payload = { serviceOrderId: serviceOrder.id };
        const result = await getServiceOrderTurnsCountPipeline(payload);

        expect(result).to.eql({
            dryerTurnsCount: 1,
            washerTurnsCount: 1
        });
    });

    it('it should reject if invalid payload is provided', async () => {
        await expect(getServiceOrderTurnsCountPipeline()).to.be.rejected;
        await expect(getServiceOrderTurnsCountPipeline(null)).to.be.rejected;
        await expect(getServiceOrderTurnsCountPipeline({})).to.be.rejected;
    });
});

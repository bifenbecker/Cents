require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { createServiceOrderTurn } = require('../../../../support/serviceOrderTestHelper');
const getServiceOrderTurnsCountUOW = require('../../../../../uow/machines/turnList/getServiceOrderTurnsCountUOW');

describe('test getServiceOrderTurnsCountUOW', () => {
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
        const result = await getServiceOrderTurnsCountUOW({ serviceOrderId: serviceOrder.id });

        expect(result).to.eql({
            dryerTurnsCount: 1,
            washerTurnsCount: 1
        });
    });

    it('it should return 0 count for non-existing serviceOrder', async () => {
        const result = await getServiceOrderTurnsCountUOW({ serviceOrderId: -1 });

        expect(result).to.eql({
            dryerTurnsCount: 0,
            washerTurnsCount: 0
        });
    });

    it('it should return 0 count for serviceOrder w/o machine turns', async () => {
        const justServiceOrder = await factory.create(FN.serviceOrder, {
            storeId: serviceOrder.storeId,
            storeCustomerId: serviceOrder.storeCustomerId,
        });
        const result = await getServiceOrderTurnsCountUOW({ serviceOrderId: justServiceOrder.id });

        expect(result).to.eql({
            dryerTurnsCount: 0,
            washerTurnsCount: 0
        });
    });

    it('it should reject if serviceOrder is not number', async () => {
        await expect(getServiceOrderTurnsCountUOW({ serviceOrderId: 'ABC' })).to.be.rejected;
    });
});
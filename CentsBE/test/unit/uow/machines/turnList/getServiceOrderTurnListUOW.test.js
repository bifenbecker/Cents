require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const serviceOrderTurnList = require('../../../../../uow/machines/turnList/getServiceOrderTurnListUOW');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test getServiceOrderTurnListUOW', () => {
    let user, store, device, serviceOrder;

    beforeEach(async () => {
        user = await factory.create(FN.user);
        store = await factory.create(FN.store);
        device = await factory.create(FN.device);
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    it('should return service order turn list', async () => {
        const machineType = await factory.create(FN.machineType, {
            name: 'WASHER',
        });
        const machineModel = await factory.create(FN.machineModel, {
            typeId: machineType.id,
        });
        const machine = await factory.create(FN.machine, {
            modelId: machineModel.id,
        });
        const turn = await factory.create(FN.turn, {
            userId: user.id,
            deviceId: device.id,
            machineId: machine.id,
            storeId: store.id,
        });
        const turnLineItem = await factory.create(FN.turnLineItem, {
            turnId: turn.id,
        });
        const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
            turnId: turn.id,
        });
        const payload = {
            serviceOrderId: serviceOrder.id,
        };
        const result = await serviceOrderTurnList(payload);
        expect(result.length).to.eq(1);
        expect(result[0].status).to.eq('COMPLETED');
        expect(result[0].machine.type).to.eq('W');
        expect(result[0].quantity).to.eq(turnLineItem.quantity);
    });

    it('should return service order turn list with machine type', async () => {
        const machineType = await factory.create(FN.machineType, {
            name: 'D',
        });
        const machineModel = await factory.create(FN.machineModel, {
            typeId: machineType.id,
        });
        const machine = await factory.create(FN.machine, {
            modelId: machineModel.id,
        });
        const turn = await factory.create(FN.turn, {
            userId: user.id,
            deviceId: device.id,
            machineId: machine.id,
            storeId: store.id,
        });
        const turnLineItem = await factory.create(FN.turnLineItem, {
            turnId: turn.id,
            turnTime: 0,
        });
        const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
            turnId: turn.id,
        });
        const payload = {
            serviceOrderId: serviceOrder.id,
            type: 'D',
        };
        const result = await serviceOrderTurnList(payload);
        expect(result.length).to.eq(1);
        expect(result[0].status).to.eq('COMPLETED');
        expect(result[0].machine.type).to.eq('D');
        expect(result[0].totalTurnTime).to.eq(turnLineItem.turnTime);
        expect(result[0].quantity).to.eq(turnLineItem.quantity);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(serviceOrderTurnList()).to.be.rejected;
        await expect(serviceOrderTurnList(null)).to.be.rejected;
        await expect(serviceOrderTurnList({})).to.be.rejected;
    });
});

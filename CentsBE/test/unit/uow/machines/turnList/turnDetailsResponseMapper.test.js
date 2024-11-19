require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { turnResponseMapper } = require('../../../../../uow/machines/turnList/turnDetailsResponseMapper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test turnDetailsResponseMapper', () => {
    it('should return details successfully', async () => {
        const user = await factory.build(FN.user, { id: 1 });
        const device = await factory.build(FN.device, {
            id: 1,
            isPaired: true,
        });
        const store = await factory.build(FN.store, {
            id: 1,
            settings: {
                timeZone: 'America/New_York',
            },
        });
        const machineType = await factory.build(FN.machineType, {
            id: 1,
            name: 'WASHER',
        });
        const model = await factory.build(FN.machineModel, {
            typeId: machineType.id,
            type: 'D',
            machineType,
        });
        const machine = await factory.build(FN.machine, {
            id: 1,
            modelId: model.id,
            model,
        });
        const turn = await factory.build(FN.turn, {
            id: 1,
            userId: user.id,
            deviceId: device.id,
            machineId: machine.id,
            storeId: store.id,
            store,
            machine,
            device,
            turnLineItems: [await factory.build(FN.turnLineItem)],
            createdBy: {
                id: 1,
                firstname: 'Mister',
                lastname: 'Test',
            },
        });
        const result = turnResponseMapper(turn);
        expect(result.id).to.eq(turn.id);
        expect(result.status).to.eq(turn.status);
        expect(result.machine.id).to.eq(machine.id);
        expect(result.machine.name).to.eq(machine.name);
        expect(result.machine.type).to.eq('W');
        expect(result.employee.id).to.eq(turn.createdBy.id);
        expect(result.employee.firstName).to.eq(turn.createdBy.firstname);
        expect(result.employee.lastName).to.eq(turn.createdBy.lastname);
        expect(result.deviceId).to.eq(device.id);
        expect(result.quantity).to.eq(turn.turnLineItems[0].quantity);
    });

    it('should return details when machineType is "D"', async () => {
        const user = await factory.build(FN.user, { id: 1 });
        const device = await factory.build(FN.device, {
            id: 1,
            isPaired: false,
        });
        const store = await factory.build(FN.store, {
            id: 1,
            settings: {
                timeZone: null,
            },
        });
        const machineType = await factory.build(FN.machineType, {
            id: 1,
            name: 'D',
        });
        const model = await factory.build(FN.machineModel, {
            typeId: machineType.id,
            type: 'D',
            machineType,
        });
        const machine = await factory.build(FN.machine, {
            id: 1,
            modelId: model.id,
            model,
        });
        const turn = await factory.build(FN.turn, {
            id: 1,
            userId: user.id,
            deviceId: device.id,
            machineId: machine.id,
            storeId: store.id,
            store,
            machine,
            device,
            turnLineItems: [
                await factory.build(FN.turnLineItem, {
                    turnTime: 0,
                })
            ],
        });
        const result = turnResponseMapper(turn);
        expect(result.id).to.eq(turn.id);
        expect(result.status).to.eq(turn.status);
        expect(result.machine.id).to.eq(machine.id);
        expect(result.machine.name).to.eq(machine.name);
        expect(result.machine.type).to.eq('D');
        expect(result.quantity).to.eq(turn.turnLineItems[0].quantity);
        expect(result.totalTurnTime).to.eq(turn.turnLineItems[0].turnTime);
    });

    it('should throw an error if passed payload with incorrect data', async () => {
        expect(() => turnResponseMapper()).to.throw(TypeError, 'Cannot read property \'store\' of undefined');
    });
});

require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { deviceStatuses } = require('../../../../../constants/constants');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const {
    createTurnMessageBuilder,
} = require('../../../../../uow/machines/runMachine/createTurnMessageBuilder');

describe('test createTurnMessageBuilder', () => {
    it('should add a pusher message to payload if device exists', async () => {
        const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
            }),
            machine = await factory.create(FACTORIES_NAMES.machine),
            turn = await factory.create(FACTORIES_NAMES.turn, {
                machineId: machine.id,
                deviceId: device.id,
            });

        const payload = {
            device,
            machineId: machine.id,
            turn,
        };

        const result = createTurnMessageBuilder(payload);

        expect(result).to.equal(payload);
        expect(result.pusherMessage).to.exist.and.to.be.an('object');
        expect(result.pusherMessage.storeId).to.exist.and.to.equal(payload.turn.storeId);
        expect(result.pusherMessage.message).to.exist.and.to.deep.include({
            deviceId: payload.device.id,
            machineId: payload.machineId,
            status: payload.device.status,
            deviceName: payload.device.name,
            activeTurn: {
                id: payload.turn.id,
                serviceType: payload.turn.serviceType,
            },
        });
    });

    it("shouldn't add a pusher message to payload if device does not exist", async () => {
        const machine = await factory.create(FACTORIES_NAMES.machine),
            turn = await factory.create(FACTORIES_NAMES.turn, {
                machineId: machine.id,
            });

        const payload = {
            machineId: machine.id,
            turn,
        };

        const result = createTurnMessageBuilder(payload);

        expect(result).to.equal(payload);
        expect(result.pusherMessage).to.not.exist;
    });

    it('should be rejected if invalid args were passed', () => {
        expect(createTurnMessageBuilder).to.throw();
        expect(() => createTurnMessageBuilder(null)).to.throw();
    });
});

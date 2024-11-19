require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { deviceStatuses } = require('../../../../../constants/constants');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const {
    createTurnMqttMessageBuilder,
} = require('../../../../../uow/machines/runMachine/mqttMessageBuilder');

describe('test mqttMessageBuilder', () => {
    it('should add a mqtt message to payload if device exists', async () => {
        const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
            }),
            turn = await factory.create(FACTORIES_NAMES.turn, {
                deviceId: device.id,
                netOrderTotalInCents: 55,
            });

        const payload = {
            device,
            turn,
        };

        const result = createTurnMqttMessageBuilder(payload);

        expect(result).to.equal(payload);
        expect(result.mqttMessage).to.exist.and.to.be.an('object').and.to.include({
            paymentStatus: 'SUCCESS',
            paymentType: 'App',
            amount: 0.55,
            startSignal: 1,
            type: 'REMOTE_START',
            deviceName: payload.device.name,
        });
        expect(result.mqttMessage.turnId).to.be.a('string');
        expect(result.mqttMessage.idempotencyKey).to.exist.and.to.be.a('string');
    });

    it("shouldn't add a mqtt message to payload if device does not exist", async () => {
        const turn = await factory.create(FACTORIES_NAMES.turn);

        const payload = {
            turn,
        };

        const result = createTurnMqttMessageBuilder(payload);

        expect(result).to.equal(payload);
        expect(result.mqttMessage).to.not.exist;
    });

    it('should be rejected if invalid args were passed', () => {
        expect(createTurnMqttMessageBuilder).to.throw();
        expect(() => createTurnMqttMessageBuilder(null)).to.throw();
    });
});

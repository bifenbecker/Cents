const Joi = require('@hapi/joi');
const Strategy = require('./Strategy');
const DeviceUtils = require('./DeviceUtils');
const Turn = require('../../../models/turns');

class ErrorHandler extends Strategy {
    constructor(payload) {
        super();
        this.payload = payload;
        this.device = null;
    }

    typeValidations() {
        const schema = Joi.object().keys({
            lmErrorEnumeration: Joi.array().optional().allow(null),
            serialErrorEnumeration: Joi.array().optional().allow(null),
            emvErrorEnumeration: Joi.array().optional().allow(null),
            pennyErrorEnumeration: Joi.array().optional().allow(null),
            deviceName: Joi.string().trim().required(),
        });
        const isValid = Joi.validate(this.payload, schema);
        if (isValid.error) {
            throw new Error(isValid.error.message);
        }
    }

    async updateDevice(errors) {
        this.device = await DeviceUtils.updateDevice(
            this.device.id,
            {
                error: errors || null,
            },
            this.transaction,
        );
    }

    async getLastTurn() {
        const turn =
            (await Turn.query(this.transaction)
                .orderBy('createdAt', 'desc')
                .where({
                    deviceId: this.device.id,
                })
                .limit(1)
                .first()) || {};
        return turn;
    }

    async buildResp(lastTurn) {
        const { completedAt } = this.lastTurn;
        const resp = await DeviceUtils.getDeviceAndMachineDetails(this.device);
        if (!completedAt) {
            resp.activeTurn = {
                id: lastTurn.id,
                serviceType: lastTurn.serviceType,
            };
        }
        return resp;
    }

    async perform() {
        const { deviceName, ...errors } = this.payload;
        this.device = await DeviceUtils.findDevice(deviceName, this.transaction);
        await this.updateDevice(errors);
        const store = await DeviceUtils.getStore(this.device.id);
        const lastTurn = await this.getLastTurn();
        const resp = await this.buildResp(lastTurn);
        return [resp, store];
    }
}

module.exports = ErrorHandler;

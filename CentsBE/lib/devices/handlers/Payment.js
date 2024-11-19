const Joi = require('@hapi/joi');
const Strategy = require('./Strategy');
const DeviceUtils = require('./DeviceUtils');
const Turn = require('../../../models/turns');
const TurnLineItem = require('../../../models/turnLineItems');
const MachinePayments = require('../../../models/machinePayment');

const {
    turnStatuses,
    DEVICE_STATUS_MAPPINGS,
    DEVICE_PAYMENT_MAPPING,
} = require('../../../constants/constants');

const SelfServeTurnBuilder = require('./builders/SelfServeTurnBuilder');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

class Payment extends Strategy {
    constructor(payload) {
        super();
        this.turn = null;
        this.device = null;
        this.machine = null;
        this.payload = payload;
        this.machinePaymentType = null;
    }

    typeValidations() {
        const schema = Joi.object().keys({
            paymentType: Joi.string().required().valid(['APP', 'CLOUD', 'EMV', 'COIN', 'EXTERNAL']),
            orderId: Joi.number().required(),
            paymentStatus: Joi.string().required(),
            paymentEnumeration: Joi.any(),
            deviceName: Joi.string().trim().required(),
            currentTimeStamp: Joi.date().required(),
        });
        const isValid = Joi.validate(this.payload, schema);
        if (isValid.error) {
            throw new Error(isValid.error.message);
        }
    }

    get isServerPayment() {
        const { paymentType } = this.payload;
        return paymentType === 'APP' || paymentType === 'CLOUD';
    }

    async findTurn() {
        const { orderId, paymentType } = this.payload;
        const whereObj = {
            deviceId: this.device.id,
        };
        if (this.isServerPayment) {
            whereObj.id = orderId;
        } else {
            whereObj.deviceOrderId = `${DEVICE_PAYMENT_MAPPING[paymentType]}_${orderId}`;
            whereObj.completedAt = null;
        }
        const turn = (await Turn.query(this.transaction).where(whereObj).first()) || {};
        return turn;
    }

    async buildResp(lastTurn) {
        const { completedAt } = lastTurn;
        const resp = await DeviceUtils.getDeviceAndMachineDetails(this.device);
        if (!completedAt) {
            resp.activeTurn = {
                id: lastTurn.id,
                serviceType: lastTurn.serviceType,
            };
        }
        return resp;
    }

    async updateTurnForServerPayment() {
        const { orderId } = this.payload;
        const { status, id } = this.turn;
        if (!id) {
            throw new Error('CLOUD_TURN_NOT_FOUND');
        }
        if (status === 'COMPLETED') {
            throw new Error('CAN_NOT_UPDATE_COMPLETED_ORDER');
        }
        // update TURN status to enabled for cloud payment.
        if (status === 'CREATED') {
            // for cloud payment the payment record and line item would
            // already be created during payment process.
            await Turn.query(this.transaction)
                .patch({
                    status: turnStatuses.ENABLED,
                    enabledAt: new Date(),
                    deviceOrderId: orderId,
                })
                .findById(id);
        }
    }

    async getMachineDetails() {
        const machine = await DeviceUtils.machineDetails({
            device: this.device,
            transaction: this.transaction,
        });
        if (!machine) {
            throw new Error('DEVICE_NOT_PAIRED');
        }
        this.machine = machine;
    }

    async addPaymentTypeDetails() {
        const { paymentType } = this.payload;
        this.machinePaymentType = await DeviceUtils.getMachinePaymentType({
            type: paymentType,
            transaction: this.transaction,
        });
        if (!this.machinePaymentType) {
            throw new Error('PAYMENT_TYPE_NOT_FOUND');
        }
    }

    async buildSelfServeTurn() {
        let maxTurnId;
        let turn = {};
        if (this.machine.machineType !== 'DRYER') {
            turn = await DeviceUtils.findPreviousPayment({
                device: this.device,
                transaction: this.transaction,
                paymentTime: this.payload.currentTimeStamp,
            });
        }
        let storeCustomer = {};
        if (!turn.id) {
            maxTurnId = await DeviceUtils.getTurnCode({
                transaction: this.transaction,
                businessId: this.machine.businessId,
            });
            storeCustomer = await DeviceUtils.findGuestCustomer({
                storeId: this.machine.storeId,
                transaction: this.transaction,
            });
        }
        const selfServeTurn = new SelfServeTurnBuilder({
            ...this.payload,
            device: this.device,
            machine: this.machine,
            machinePaymentType: this.machinePaymentType,
            lastTurn: maxTurnId,
            currentTurn: turn,
            storeCustomer,
        }).build();
        if (turn && turn.id) {
            const { id, turnLineItems, machinePayments, ...rest } = selfServeTurn;
            const updatedTurn = await Turn.query(this.transaction)
                .patch(rest)
                .findById(id)
                .returning('*');
            await TurnLineItem.query(this.transaction).insert(turnLineItems);
            await MachinePayments.query(this.transaction).insert(machinePayments);
            return updatedTurn;
        }
        const newTurn = await Turn.query(this.transaction)
            .insertGraph(selfServeTurn)
            .returning('*');
        return newTurn;
    }

    async updateDevice() {
        this.device = await DeviceUtils.updateDevice(
            this.device.id,
            {
                status: DEVICE_STATUS_MAPPINGS.RUNNING,
                error: null,
            },
            this.transaction,
        );
    }

    //  Handled by cron job.
    // async updateMachineStats() {
    //     await DeviceUtils.updateMachineStats({
    //         machine: this.machine,
    //         paymentEnumerations: this.payload.paymentEnumeration,
    //         transaction: this.transaction,
    //     });
    // }

    async perform() {
        const { deviceName } = this.payload;
        this.device = await DeviceUtils.findDevice(deviceName, this.transaction);
        await this.updateDevice();
        const store = await DeviceUtils.getStore(this.device.id);
        this.turn = await this.findTurn();
        if (this.isServerPayment) {
            LoggerHandler('info', 'Server payment confirmation received.');
            await this.updateTurnForServerPayment();
            const resp = await this.buildResp(this.turn);
            return [resp, store];
        }
        LoggerHandler('info', 'Payment request received for self serve wash.');
        await this.getMachineDetails();
        await this.addPaymentTypeDetails();
        let createdTurn = this.turn;
        if (this.turn && this.turn.id) {
            LoggerHandler('error', 'Payment details received for an existing order.');
            const {
                payload: { paymentEnumeration, currentTimeStamp },
                machinePaymentType,
            } = this;
            await MachinePayments.query(this.transaction).insert({
                details: paymentEnumeration,
                paymentTypeId: machinePaymentType.id,
                createdAt: currentTimeStamp,
                turnId: this.turn.id,
            });
        } else {
            createdTurn = await this.buildSelfServeTurn();
        }
        const resp = await this.buildResp(createdTurn);
        return [resp, store];
    }
}

module.exports = Payment;

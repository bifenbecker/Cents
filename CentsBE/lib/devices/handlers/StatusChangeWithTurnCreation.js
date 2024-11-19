const Joi = require('@hapi/joi');
const momenttz = require('moment-timezone');
const Strategy = require('./Strategy');
const DeviceUtils = require('./DeviceUtils');
const Turn = require('../../../models/turns');
const StatusTurnBuilder = require('./builders/StatusTurnBuilder');

// This file included turn creation for an unknown device order id.
const {
    CYCLE_MODES,
    turnStatuses,
    DEVICE_PAYMENT_TYPES,
    DEVICE_STATUS_MAPPINGS,
} = require('../../../constants/constants');
const { machineDetails } = require('./DeviceUtils');

class StatusChange extends Strategy {
    constructor(payload) {
        super();
        this.payload = payload;
        this.device = null;
        this.machine = null;
    }

    typeValidations() {
        const schema = Joi.object().keys({
            cycleMode: Joi.string().required().valid(['RUNNING', 'IDLE']),
            cycleId: Joi.string().allow(null, '').required(),
            cyclePrice: Joi.number().optional().allow(null, ''),
            timeData: Joi.string().optional().allow(null, ''),
            errorStatus: Joi.any().optional(),
            deviceName: Joi.string().trim().required(),
            currentTimeStamp: Joi.date().required(),
        });
        const isValid = Joi.validate(this.payload, schema);
        if (isValid.error) {
            throw new Error(isValid.error.message);
        }
    }

    requiresStatusChangeMessage() {
        const {
            device: { status, error },
            payload: { cycleMode, errorStatus },
        } = this;
        if (DEVICE_STATUS_MAPPINGS[cycleMode] !== status || error !== errorStatus) {
            return true;
        }
        return false;
    }

    setCycleIdDetails() {
        const { cycleId = '', cycleMode } = this.payload;
        if (cycleMode === 'IDLE') {
            return;
        }
        if (!cycleId && cycleMode !== 'IDLE') {
            throw new Error('CYCLE_ID_IS_REQUIRED');
        }
        const cycleIdSplit = cycleId.split('_');
        if (cycleIdSplit.length === 4) {
            this.cycleOrderId = cycleIdSplit[cycleIdSplit.length - 1];
            this.cyclePaymentTypeId = cycleIdSplit[cycleIdSplit.length - 2];
        } else {
            throw new Error('INVALID_CYCLE_ID');
        }
    }

    isCloudPayment() {
        return (
            DEVICE_PAYMENT_TYPES[this.cyclePaymentTypeId] === 'CLOUD' ||
            DEVICE_PAYMENT_TYPES[this.cyclePaymentTypeId] === 'APP'
        );
    }

    async activeTurn() {
        // completedAt is null. status is not completed.
        const { cycleMode } = this.payload;
        let turn;
        const query = Turn.query(this.transaction).orderBy('createdAt', 'desc').limit(1).first();
        if (cycleMode === CYCLE_MODES.IDLE) {
            turn = await query
                .where('status', '<>', turnStatuses.COMPLETED)
                .andWhere('deviceId', this.device.id);
        } else {
            if (this.isCloudPayment()) {
                // check for the turn based of id.
                turn = await query.where('id', this.cycleOrderId);
            } else {
                // search based upon device order id and machine id.
                turn = await query.where({
                    deviceOrderId: `${this.cyclePaymentTypeId}_${this.cycleOrderId}`,
                    deviceId: this.device.id,
                    completedAt: null,
                });
            }
        }
        return turn || {};
    }

    needsTurnStatusUpdate(turn) {
        const { cycleMode } = this.payload;
        if (cycleMode === 'RUNNING' && !turn.id && this.isCloudPayment()) {
            throw new Error('CLOUD_PAYMENT_TURN_NOT_FOUND');
        }
        if (cycleMode === 'RUNNING' && !turn.id) {
            return { newTurn: true, statusChange: false };
        }
        if (cycleMode === 'RUNNING' && turn.startedAt) {
            return { newTurn: false, statusChange: false };
        }
        if (cycleMode === 'IDLE' && !turn.id) {
            return { newTurn: false, statusChange: false };
        }
        return { newTurn: false, statusChange: true };
    }

    async createSelfServeTurn() {
        const machineDetails = await DeviceUtils.machineDetails({
            device: this.device,
            transaction: this.transaction,
        });
        const storeDetails = await DeviceUtils.getStoreDetails({
            storeId: machineDetails.storeId,
            transaction: this.transaction,
        });
        if (!machineDetails) {
            throw new Error('DEVICE_NOT_PAIRED');
        }
        const maxTurnId = await DeviceUtils.getTurnCode({
            transaction: this.transaction,
            businessId: machineDetails.businessId,
        });
        const storeCustomer = await DeviceUtils.findGuestCustomer({
            transaction: this.transaction,
            storeId: machineDetails.storeId,
        });
        const selfServeTurn = new StatusTurnBuilder({
            device: this.device,
            machine: machineDetails,
            deviceOrderId: `${this.cyclePaymentTypeId}_${this.cycleOrderId}`,
            lastTurn: maxTurnId,
            ...this.payload,
            storeCustomer,
            paymentTypeId: this.cyclePaymentTypeId,
        }).build();
        const { currentTimeStamp = new Date().toISOString() } = this.payload;
        const startedAt = momenttz
            .tz(currentTimeStamp, storeDetails.timeZone)
            .utc()
            .format('YYYY-MM-DDTHH:mm:ss.SSSS');
        const turn = await Turn.query(this.transaction)
            .insertGraph({
                ...selfServeTurn,
                status: 'RUNNING',
                startedAt,
            })
            .returning('*');
        return turn;
    }

    async upsertTurn(turn) {
        const { cycleMode, cycleId, currentTimeStamp = new Date().toISOString() } = this.payload;
        const { newTurn, statusChange } = this.needsTurnStatusUpdate(turn);
        if (newTurn) {
            // create new turn with cycle details.
            const newTurn = await this.createSelfServeTurn();
            return newTurn;
        }
        if (!statusChange) {
            return null;
        }
        let updateObj;
        let updateQuery = Turn.query(this.transaction).returning('*');
        if (cycleMode === 'IDLE') {
            updateObj = {
                status: turnStatuses.COMPLETED,
                completedAt: currentTimeStamp,
                paymentStatus: 'PAID',
            };
            updateQuery = updateQuery.where({
                deviceId: this.device.id,
                completedAt: null,
            });
        } else {
            const storeDetails = DeviceUtils.getStoreDetails({
                storeId: machineDetails.storeId,
                transaction: this.transaction,
            });
            const startedAt = momenttz
                .tz(currentTimeStamp, storeDetails.timeZone)
                .utc()
                .format('YYYY-MM-DDTHH:mm:ss.SSSS');
            updateObj = {
                status: turnStatuses.STARTED,
                startedAt,
                lmCycleId: cycleId,
                paymentStatus: 'PAID',
            };
            updateQuery = updateQuery.findById(turn.id);
        }
        const updatedTurn = await updateQuery.patch(updateObj);
        return updatedTurn;
    }

    async buildResp(lastTurn) {
        const { cycleMode } = this.payload;
        const resp = await DeviceUtils.getDeviceAndMachineDetails(this.device);
        if (!resp.machineId) {
            return undefined;
        }
        if (cycleMode !== 'IDLE' && lastTurn) {
            resp.activeTurn = {
                id: lastTurn.id,
                serviceType: lastTurn.serviceType,
            };
        }
        return resp;
    }

    async updateDevice() {
        const { errorStatus, cycleMode } = this.payload;
        this.device = await DeviceUtils.updateDevice(
            this.device.id,
            {
                status: DEVICE_STATUS_MAPPINGS[cycleMode],
                error: errorStatus || null,
                lastOfflineAt: null,
            },
            this.transaction,
        );
    }

    async perform() {
        const { deviceName, errorStatus } = this.payload;
        this.device = await DeviceUtils.findDevice(deviceName.trim(), this.transaction);
        const requiresStatusChangeMessage = this.requiresStatusChangeMessage();
        this.setCycleIdDetails();
        this.previousErrorState = this.device.error;
        await this.updateDevice();
        let lastTurn = await this.activeTurn();
        const store = await DeviceUtils.getStore(this.device.id);
        if (!errorStatus) {
            lastTurn = await this.upsertTurn(lastTurn);
        }
        if (!requiresStatusChangeMessage) {
            return [];
        }
        const resp = await this.buildResp(lastTurn);
        return [resp, store];
    }
}

module.exports = StatusChange;

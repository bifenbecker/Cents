const Joi = require('@hapi/joi');

const Batch = require('../../models/batch');
const Store = require('../../models/store');
const Pairing = require('../../models/pairing');
const Machine = require('../../models/machine');

const getBusiness = require('../../utils/getBusiness');
const validateTeamMember = require('../validateTeamMember');

function typeValidations(req, origin) {
    let schema = Joi.object().keys({
        storeId: Joi.number()
            .integer()
            .required()
            .error(new Error('Store id of type integer is required.')),
        deviceId: Joi.number()
            .integer()
            .required()
            .error(new Error('Device id of type integer is required.')),
        pricePerTurnInCents: Joi.number()
            .optional()
            .integer()
            .min(0)
            .error(new Error('Price per turn of type integer is required.')),
        turnTime: Joi.number()
            .integer()
            .optional()
            .error(new Error('Turn time in minutes  is required.')),
    });
    if (origin === 'EMPLOYEE_TAB') {
        const { requiresEmployeeCode } = req.currentStore.settings;
        if (requiresEmployeeCode) {
            schema = schema.keys({
                employeeCode: Joi.number()
                    .integer()
                    .min(1)
                    .required()
                    .error(new Error('Employee code of type integer greater than 0 is required.')),
            });
        }
    }
    const error = Joi.validate(req.body, schema);
    return error;
}

async function validateDevice(businessId, deviceId, storeId) {
    const device = await Batch.query()
        .select('devices.*', 'batches.storeId')
        .join('devices', 'devices.batchId', 'batches.id')
        .where({
            'batches.businessId': businessId,
            'devices.id': deviceId,
            'batches.storeId': storeId,
        })
        .first();
    return device;
}

async function validateMachine(businessId, machineId, storeId) {
    const machine = await Machine.query()
        .select('machines.*', 'machineTypes.name as type')
        .join('stores', 'stores.id', 'machines.storeId')
        .join('machineModels', 'machineModels.id', 'machines.modelId')
        .join('machineTypes', 'machineTypes.id', 'machineModels.typeId')
        .where({
            'stores.businessId': businessId,
            'machines.id': machineId,
            'machines.storeId': storeId,
        })
        .first();
    return machine;
}

async function checkPaired(machineId, deviceId) {
    const isDevicePaired = await Pairing.query().findOne({
        deviceId,
        deletedAt: null,
    });
    if (isDevicePaired) {
        return { message: 'Device is already paired.', error: true };
    }
    const isMachinePaired = await Pairing.query().findOne({
        machineId,
        deletedAt: null,
    });
    if (isMachinePaired) {
        return { message: 'Machine is already paired.', error: true };
    }
    return { error: false };
}

function getReqOrigin(req) {
    const url = req.originalUrl;
    if (url.includes('employee-tab')) {
        return 'EMPLOYEE_TAB';
    }
    return 'BUSINESS_MANAGER';
}

async function checkStore(storeId, businessId) {
    const store = await Store.query().findOne({
        id: storeId,
        businessId,
    });
    return !!store;
}

async function validateData(req, res, next) {
    try {
        const reqOrigin = getReqOrigin(req);
        req.constants = req.constants || {};
        const isTypeValid = typeValidations(req, reqOrigin);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const {
            body: { deviceId, storeId, employeeCode, pricePerTurnInCents, turnTime },
            params: { machineId },
            currentUser,
            currentStore,
        } = req;

        let businessId;

        if (currentUser) {
            const business = await getBusiness(req);
            businessId = business.id;
            const isStoreValid = await checkStore(storeId, businessId);
            if (!isStoreValid) {
                res.status(404).json({
                    error: 'Store not found.',
                });
                return;
            }
            req.constants.user = { ...currentUser, source: 'BUSINESS_MANAGER' };
        } else {
            businessId = currentStore.businessId;
            if (storeId !== currentStore.id) {
                res.status(409).json({
                    error: "Store id should match to current store's id.",
                });
                return;
            }
        }
        req.constants.businessId = businessId;
        const isDevice = await validateDevice(businessId, deviceId, storeId);
        if (!isDevice) {
            res.status(404).json({
                error: 'Device not found for the store.',
            });
            return;
        }
        if (isDevice.status === 'OFFLINE') {
            res.status(409).json({
                error: 'Can not pair device and machine as device is offline.',
            });
            return;
        }

        const isMachine = await validateMachine(businessId, machineId, storeId);
        if (!isMachine) {
            res.status(404).json({
                error: 'Machine not found for the store.',
            });
            return;
        }

        const checkPairing = await checkPaired(machineId, deviceId);

        if (checkPairing.error) {
            res.status(409).json({
                error: checkPairing.message,
            });
            return;
        }

        if (reqOrigin === 'EMPLOYEE_TAB') {
            const { requiresEmployeeCode } = req.currentStore.settings;
            if (requiresEmployeeCode) {
                const teamMember = await validateTeamMember(
                    employeeCode,
                    businessId,
                    req.currentStore.id,
                );
                req.constants.user = { teamMember, source: 'EMPLOYEE_APP' };
            }
        }

        const { type } = isMachine;
        if (type === 'washer' || type === 'WASHER') {
            if (pricePerTurnInCents === undefined) {
                res.status(422).json({
                    error: 'Price per turn is required for a washer.',
                });
                return;
            }
            if (turnTime) {
                res.status(422).json({
                    error: 'Turn time is not allowed for a washer.',
                });
                return;
            }
        }

        if (type === 'dryer' || type === 'DRYER') {
            if (turnTime === undefined) {
                res.status(422).json({
                    error: 'Turn time is required for a dryer.',
                });
                return;
            }
            if (pricePerTurnInCents && pricePerTurnInCents !== 25) {
                res.status(422).json({
                    error: 'Price per turn for a dryer should be 25 cents.',
                });
                return;
            }
        }
        req.constants.machine = isMachine;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateData;

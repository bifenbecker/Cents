const Joi = require('@hapi/joi');
const { getReqOrigin } = require('../validationUtil');
const getBusiness = require('../../utils/getBusiness');
const validateTeamMember = require('../validateTeamMember');
const Device = require('../../models/device');
const Pairing = require('../../models/pairing');
const validateEmployeeCode = require('../validateEmployeeCode');

function typeValidations(req, origin) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer().min(1).required(),
    });
    let extendedSchema = schema;
    if (origin === 'EMPLOYEE_TAB' && req.currentStore.settings.requiresEmployeeCode) {
        extendedSchema = extendedSchema.append({
            employeeCode: Joi.number().integer().min(1).required(),
        });
    } else {
        extendedSchema = extendedSchema.append({
            employeeCode: Joi.number().integer().optional(),
        });
    }
    const validate = Joi.validate({ ...req.body, ...req.params }, extendedSchema);
    if (validate.error) {
        throw new Error(validate.error.details[0].message);
    }
}
async function verifyTeamMember(req, businessId) {
    const { requiresEmployeeCode } = req.currentStore.settings;
    if (requiresEmployeeCode) {
        await validateEmployeeCode(
            req.body.employeeCode,
            req.currentStore.businessId,
            req.currentStore.id,
        );
        const teamMember = await validateTeamMember(
            req.body.employeeCode,
            businessId,
            req.currentStore.id,
        );
        return teamMember.userId;
    }
    return null;
}
/**
 *returns businessId and userId
 *
 * @param {*} req
 * @param {*} origin
 * @return {*}
 */
async function validateBusinessValidation(req, origin) {
    let businessId;
    let userId;
    if (origin === 'BUSINESS_MANAGER') {
        businessId = (await getBusiness(req)).id;
        userId = req.currentUser.id;
    } else {
        businessId = req.currentStore.businessId;
        userId = await verifyTeamMember(req, businessId);
    }
    if (!businessId) {
        throw new Error('business not found');
    }
    return { userId, businessId };
}
async function devicePairingAndStatusValidations(req) {
    const pairedDevice = await Pairing.query()
        .where('machineId', '=', req.params.machineId)
        .andWhere('deletedAt', null)
        .first();
    if (!pairedDevice) throw new Error('[MachinePairingError] Machine is already un paired');
    const deviceData = await Device.query().findById(pairedDevice.deviceId);
    if (['IN_USE'].includes(deviceData.status)) {
        throw new Error('[DeviceInUseError] Device selected to unpair is in-use');
    }
}
async function unpairDeviceValidation(req, res, next) {
    try {
        const origin = getReqOrigin(req);
        typeValidations(req, origin);
        const { userId } = await validateBusinessValidation(req, origin);
        req.body.userId = userId;
        await devicePairingAndStatusValidations(req);
        req.body.origin = origin;
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = exports = {
    verifyTeamMember,
    validateBusinessValidation,
    unpairDeviceValidation,
};

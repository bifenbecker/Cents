const Joi = require('@hapi/joi');
const { getReqOrigin } = require('../validationUtil');
const Store = require('../../models/store');
const Machine = require('../../models/machine');
const MachineModel = require('../../models/machineModel');
const { validateBusinessValidation } = require('./unpairDevice');

function typeValidations(inputObj, origin) {
    const schema = Joi.object().keys({
        deviceId: Joi.number().integer().optional(),
        modelId: Joi.number().integer().required(),
        name: Joi.string().trim().max(8).min(1).required(),
        storeId: Joi.number().integer().required(),
        serialNumber: Joi.string().optional().allow('', null),
    });
    let extendedSchema = schema;
    if (origin === 'EMPLOYEE_TAB' && inputObj.currentStore.settings.requiresEmployeeCode) {
        extendedSchema = extendedSchema.append({
            employeeCode: Joi.number().required(),
        });
    } else {
        extendedSchema = extendedSchema.append({
            employeeCode: Joi.number().optional(),
        });
    }
    if (inputObj.machineType === 'WASHER') {
        extendedSchema = extendedSchema.append({
            pricePerTurnInCents: Joi.number().integer().min(1).required(),
        });
    } else if (inputObj.machineType === 'DRYER') {
        extendedSchema = extendedSchema.append({
            turnTimeInMinutes: Joi.number().integer().min(1).max(99).required(),
        });
    }

    const validate = Joi.validate(inputObj.body, extendedSchema);
    if (validate.error) {
        throw new Error(validate.error.details[0].message);
    }
}
/**
 *
 * function to validate adding a machine and pairing
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function validateAddMachine(req, res, next) {
    try {
        const origin = getReqOrigin(req);
        if (!req.body.modelId) {
            res.status(422).json({
                error: 'modelId is required.',
            });
            return;
        }
        const { name } = await MachineModel.query()
            .select('machineTypes.name')
            .join('machineTypes', 'machineTypes.id', 'machineModels.typeId')
            .findById(Number(req.body.modelId));

        typeValidations({ ...req, machineType: name }, origin);
        const { businessId } = await validateBusinessValidation(req, origin);
        const isStoresValid = await Store.query()
            .where('id', req.body.storeId)
            .andWhere('businessId', businessId);
        if (!isStoresValid.length) {
            res.status(409).json({
                error: 'Invalid store id.',
            });
            return;
        }
        if (req.body.serialNumber) {
            const machine = await Machine.query().where('serialNumber', req.body.serialNumber);
            if (machine.length) {
                res.status(409).json({
                    error: 'Barcode already Exists',
                });
                return;
            }
        }
        if (req.body.serialNumber && req.body.serialNumber.length > 25) {
            res.status(409).json({
                error: 'Barcode length exceeded.',
            });
            return;
        }

        req.body.origin = origin;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateAddMachine;

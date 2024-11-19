const Joi = require('@hapi/joi');
const { getReqOrigin } = require('../validationUtil');
const { validateBusinessValidation } = require('./unpairDevice');
const Store = require('../../models/store');
const Machine = require('../../models/machine');

// This function has some duplicate code from validations/machines/addMachine.js
async function validateAddOfflineMachine(req, res, next) {
    try {
        const schema = Joi.object().keys({
            storeId: Joi.number().integer().required(),
            capacity: Joi.string().required(),
            machineType: Joi.string().required(),
            modelName: Joi.string().required(),
            name: Joi.string().trim().max(8).min(1).required(),
            pricePerTurnInCents: Joi.number().integer(),
            turnTimeInMinutes: Joi.number().integer(),
            serialNumber: Joi.string().optional().allow('', null),
        });
        const origin = getReqOrigin(req);

        let extendedSchema = schema;
        if (origin === 'EMPLOYEE_TAB' && req.currentStore.settings.requiresEmployeeCode) {
            extendedSchema = extendedSchema.append({
                employeeCode: Joi.number().required(),
            });
        } else {
            extendedSchema = extendedSchema.append({
                employeeCode: Joi.number().optional(),
            });
        }
        if (req.machineType === 'WASHER') {
            extendedSchema = extendedSchema.append({
                pricePerTurnInCents: Joi.number().integer().min(1).required(),
            });
        } else if (req.machineType === 'DRYER') {
            extendedSchema = extendedSchema.append({
                turnTimeInMinutes: Joi.number().integer().min(1).max(99).required(),
            });
        }

        const validate = Joi.validate(req.body, extendedSchema);
        if (validate.error) {
            throw new Error(validate.error.details[0].message);
        }

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
    } catch (err) {
        next(err);
    }
}

module.exports = exports = validateAddOfflineMachine;

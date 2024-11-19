const Joi = require('@hapi/joi');

const { checkMachine } = require('../../lib/authentication');

// washType: 'data.washType',
// customerId: d123, // Can be null
// technicianName: 'Someone', // Can be null
// reason: 'sadasdasd',
// notes: 'data.notes',
function typeValidations(req) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer().required(),
        washType: Joi.string().required(),
        technicianName: Joi.string().optional().allow(null, ''),
        customerId: Joi.number().integer().allow(null, ''),
        reason: Joi.string().required(),
        notes: Joi.string().required(),
    });
    const error = Joi.validate(req, schema);
    return error;
}

async function validateMachineAndUser(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        // Type validations.
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        // Db validations.
        const userId = req.currentUser.id;
        const { machineId } = req.body;
        const isMachineValid = await checkMachine(userId, machineId);
        if (!isMachineValid) {
            res.status(400).json({
                error: 'You are not authorized to start the machine',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateMachineAndUser;

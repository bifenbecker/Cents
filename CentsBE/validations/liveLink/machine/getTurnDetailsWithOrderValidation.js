const Joi = require('@hapi/joi');
const Turn = require('../../../models/turns');
const StoreCustomer = require('../../../models/storeCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        turnId: Joi.number().integer().required().min(1),
    });
    return Joi.validate(inputObj, schema);
}

async function getTurnDetailsWithOrderValidation(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.params);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const {
            params: { turnId },
            currentCustomer,
        } = req;
        const turn = await Turn.query().findById(turnId);
        if (!turn) {
            res.status(404).json({
                error: 'Turn is not found',
            });
            return;
        }

        const storeCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: currentCustomer.id,
            storeId: turn.storeId,
        });
        if (!storeCustomer) {
            res.status(400).json({
                error: 'Store customer does not exist',
            });
            return;
        }

        if (storeCustomer.id !== turn.storeCustomerId) {
            res.status(403).json({
                error: 'You are not allowed to view the resource',
            });
            return;
        }

        req.constants = {
            storeCustomer,
            turn,
        };

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getTurnDetailsWithOrderValidation;

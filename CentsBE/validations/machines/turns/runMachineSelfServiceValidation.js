const Joi = require('@hapi/joi');
const Machine = require('../../../models/machine');
const CreditHistory = require('../../../models/creditHistory');
const { getMachinePricePerTurn } = require('../../../utils/machines/machineUtil');
const { convertCentsToDollars } = require('../../../utils/convertMoneyUnits');

function typeBodyValidations(inputObj) {
    const schema = Joi.object().keys({
        quantity: Joi.number().integer().min(1).allow(null),
        promoCode: Joi.string().optional().allow(null),
    });

    return Joi.validate(inputObj, schema);
}

function typeParamsValidations(inputObj) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer().min(1).required(),
    });

    return Joi.validate(inputObj, schema);
}

async function getCustomerCreditAmount(centsCustomerId, businessId) {
    const { sum } = await CreditHistory.query().sum('amount').findOne({
        customerId: centsCustomerId,
        businessId,
    });

    return Number(sum);
}

async function runMachineSelfServiceValidation(req, res, next) {
    try {
        const { body, params, currentCustomer } = req;
        const validationBody = typeBodyValidations(body);
        const validationParams = typeParamsValidations(params);
        if (validationBody.error) {
            res.status(422).json({
                error: validationBody.error.details[0].message,
            });
            return;
        }
        if (validationParams.error) {
            res.status(422).json({
                error: validationParams.error.details[0].message,
            });
            return;
        }

        const machine = await Machine.query()
            .findById(params.machineId)
            .withGraphJoined('[store, machinePricings]');
        if (!machine) {
            res.status(404).json({
                error: 'Machine is not found',
            });
            return;
        }

        const customerCreditAmount = await getCustomerCreditAmount(
            currentCustomer.id,
            machine.store.businessId,
        );
        const priceInCents = getMachinePricePerTurn(machine) * (body.quantity ?? 1);
        const priceAmountInDollars = convertCentsToDollars(priceInCents);

        if (customerCreditAmount <= priceAmountInDollars) {
            res.status(400).json({
                error: 'Not enough credits, please deposit your balance',
            });
            return;
        }

        req.constants = {
            creditAmount: priceAmountInDollars,
        };

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = runMachineSelfServiceValidation;

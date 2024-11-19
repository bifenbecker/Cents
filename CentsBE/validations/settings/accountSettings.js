const Joi = require('@hapi/joi');
const TipSettings = require('../../models/tipSettings');
const BagNoteTag = require('../../models/bagNoteTag');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object()
        .keys({
            receiptFooterMessage: Joi.string().trim().max(300).allow('', null).optional(),
            isWeightBeforeProcessing: Joi.boolean().optional(),
            isWeightAfterProcessing: Joi.boolean().optional(),
            isWeightUpOnCompletion: Joi.boolean().optional(),
            isWeightReceivingAtStore: Joi.boolean().optional(),
            isBagTrackingEnabled: Joi.boolean().optional(),
            requiresEmployeeCode: Joi.boolean().optional(),
            requiresRack: Joi.boolean().optional(),
            isCustomUrl: Joi.boolean().optional(),
            termsOfServiceUrl: Joi.string().uri().trim().optional(),
            salesWeight: Joi.string().valid('DURING_INTAKE', 'UPON_COMPLETION').optional(),
            allowInStoreTip: Joi.boolean().optional(),
            hasConvenienceFee: Joi.boolean().optional(),
            fee: Joi.number().min(1).max(100).optional(),
            tipType: Joi.string().valid('PERCENTAGE', 'DOLLAR_AMOUNT').optional(),
            tipDollars: Joi.object()
                .keys({
                    option1: Joi.number().precision(2).strict().min(1).optional(),
                    option2: Joi.number().precision(2).strict().min(1).optional(),
                    option3: Joi.number().precision(2).strict().min(1).optional(),
                })
                .min(1)
                .optional(),
            tipPercentage: Joi.object()
                .keys({
                    option1: Joi.number().integer().strict().min(1).max(100).optional(),
                    option2: Joi.number().integer().strict().min(1).max(100).optional(),
                    option3: Joi.number().integer().strict().min(1).max(100).optional(),
                })
                .min(1)
                .optional(),
            bagNoteTag: Joi.string().optional().allow('', null),
            isHangDryEnabled: Joi.boolean().optional(),
            hangDryInstructions: Joi.string().optional().allow(''),
            isCustomPreferencesEnabled: Joi.boolean().optional(),
        })
        .max(1)
        .min(1);
    const error = Joi.validate(inputObj, schema);
    return error;
}
function validateOptions(_options, body) {
    let isError = false;
    const options = { ..._options };
    delete options[Object.keys(body)[0]];
    for (const key in options) {
        if (options[key] === Object.values(body)[0]) isError = true;
    }
    return isError;
}
async function validate(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        let doesTagExist = false;
        if (isValid.error) {
            const error = {};
            isValid.error.details.forEach((detail) => {
                error[detail.path[0]] = detail.message.replace(/['"]+/g, '');
            });
            switch (Object.keys(error)[0]) {
                case 'tipPercentage':
                    res.status(422).json({
                        error: {
                            tipPercentage: {
                                [Object.keys(req.body.tipPercentage)[0]]: error.tipPercentage,
                            },
                        },
                    });
                    return;
                case 'tipDollars':
                    res.status(422).json({
                        error: {
                            tipDollars: {
                                [Object.keys(req.body.tipDollars)[0]]: error.tipDollars,
                            },
                        },
                    });
                    return;
                default:
                    res.status(422).json({
                        error,
                    });
                    return;
            }
        }
        const business = await getBusiness(req);

        if (req.body.bagNoteTag) {
            const { bagNoteTag } = req.body;
            doesTagExist = await BagNoteTag.query().findOne({
                businessId: business.id,
                name: bagNoteTag,
                isDeleted: false,
            });
        }

        if (doesTagExist) {
            res.status(409).json({
                error: {
                    bagNoteTag: 'This tag is already in use for your business.',
                },
            });
            return;
        }

        const tipSettings = await TipSettings.query().where('businessId', business.id).first();
        if (
            Object.keys(req.body)[0] === 'tipPercentage' &&
            validateOptions(tipSettings.tipPercentage, req.body.tipPercentage)
        ) {
            res.status(422).json({
                error: {
                    tipPercentage: {
                        [Object.keys(req.body.tipPercentage)[0]]: `Other option exists with value ${
                            Object.values(req.body.tipPercentage)[0]
                        }`,
                    },
                },
            });
            return;
        }
        if (
            Object.keys(req.body)[0] === 'tipDollars' &&
            validateOptions(tipSettings.tipDollars, req.body.tipDollars)
        ) {
            res.status(422).json({
                error: {
                    tipDollars: {
                        [Object.keys(req.body.tipDollars)[0]]: `Other option exists with value ${
                            Object.values(req.body.tipDollars)[0]
                        }`,
                    },
                },
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = validate;

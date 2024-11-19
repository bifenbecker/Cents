const Joi = require('@hapi/joi');

const Language = require('../../models/language');
const CentsCustomer = require('../../models/centsCustomer');
const StoreCustomer = require('../../models/storeCustomer');
const getBusiness = require('../../utils/getBusiness');

const paramDbFieldMapping = {
    boFullName: 'fullName',
    boEmail: 'email',
    boPhoneNumber: 'phoneNumber',
    language: 'languageId',
};

function typeValidations(input) {
    const schema = Joi.object().keys({
        userId: Joi.number().integer().required().error(new Error('id is required')),
        field: Joi.string()
            .required()
            .valid(Object.keys(paramDbFieldMapping))
            .error(new Error('field must be one of boFullName, boEmail, boPhoneNumber, language')),
        value: Joi.when('field', {
            is: 'boFullName',
            then: Joi.string().required().min(1),
            otherwise: Joi.when('field', {
                is: 'boEmail',
                then: Joi.string().email().required().error(new Error('Invalid email.')),
                otherwise: Joi.when('field', {
                    is: 'boPhoneNumber',
                    then: Joi.string()
                        .required()
                        .min(5)
                        .max(16)
                        .error(new Error('Invalid phone number.')),
                    otherwise: Joi.when('field', {
                        is: 'language',
                        then: Joi.number()
                            .integer()
                            .required()
                            .error(new Error('language should be an integer greater than 0.')),
                        otherwise: Joi.forbidden().error(new Error('Invalid field')),
                    }),
                }),
            }),
        }),
    });
    const validate = Joi.validate(input, schema);
    return validate;
}

async function emailPhoneValidations(field, value, id) {
    let users = CentsCustomer.query()
        .select('centsCustomers.*')
        .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
        .whereNot({
            'centsCustomers.id': id,
        });
    if (field === 'email') {
        users = users.where((query) => {
            query
                .where('centsCustomers.email', 'ilike', value.trim())
                .orWhere('storeCustomers.email', 'ilike', value.trim());
        });
    } else {
        users = users.where((query) => {
            query
                .where('centsCustomers.phoneNumber', value)
                .orWhere('storeCustomers.phoneNumber', 'ilike', value);
        });
    }
    users = await users;
    return users.length > 0;
}

async function validateDetails(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const user = await StoreCustomer.query().findOne({
            centsCustomerId: req.body.userId,
            businessId: business.id,
        });
        if (!user) {
            res.status(404).json({
                error: 'User not found.',
            });
            return;
        }
        if (req.body.field === 'boEmail') {
            const isEmailValid = await emailPhoneValidations(
                'email',
                req.body.value,
                req.body.userId,
            );
            if (isEmailValid) {
                res.status(409).json({
                    error: 'Email already exists.',
                });
                return;
            }
        }
        if (req.body.field === 'boPhoneNumber') {
            const isPhoneNumberInvalid = await emailPhoneValidations(
                'phoneNumber',
                req.body.value,
                req.body.userId,
            );
            if (isPhoneNumberInvalid) {
                res.status(409).json({
                    error: 'Phone number already exists.',
                });
                return;
            }
        }
        if (req.body.field === 'language') {
            const isLanguage = await Language.query().findById(req.body.value);
            if (!isLanguage) {
                res.status(409).json({
                    error: 'Invalid language id.',
                });
                return;
            }
        }
        req.constants = { businessId: business.id };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateDetails;

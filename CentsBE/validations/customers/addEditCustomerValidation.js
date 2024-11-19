const Joi = require('@hapi/joi');
const { raw } = require('objection');

const CentsCustomer = require('../../models/centsCustomer');

const getBusiness = require('../../utils/getBusiness');

async function checkEmail(email, businessId, centsCustomerId = null) {
    const resp = {};
    let isUser = CentsCustomer.query()
        .select(
            raw(
                'distinct ("centsCustomers".id) as id, "storeCustomers"."businessId" as "businessId"',
            ),
        )
        .leftJoin('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
        .where('centsCustomers.email', 'ilike', email)
        .orWhere('storeCustomers.email', 'ilike', email)
        .groupBy('centsCustomers.id', 'storeCustomers.businessId')
        .orderBy('businessId');
    isUser = centsCustomerId ? isUser.whereNot('centsCustomers.id', centsCustomerId) : isUser;
    isUser = await isUser;
    if (centsCustomerId && isUser.length) {
        // email is associaed with some other customer.
        resp.error = true;
        resp.message = 'Email already exists.';
    } else if (!centsCustomerId && isUser.length) {
        // check if customer exists in current business or not.
        const isBusinessCustomer = isUser.find((user) => user.businessId === businessId);
        if (isBusinessCustomer) {
            resp.error = true;
            resp.message = 'Email already exists.';
        } else {
            resp.error = false;
            resp.centsCustomerId = isUser[0].id;
        }
    } else {
        resp.error = false;
        resp.centsCustomerId = centsCustomerId;
    }
    return resp;
}

async function checkPhoneNumber(phoneNumber, businessId, centsCustomerId = null) {
    const resp = {};
    let isUser = CentsCustomer.query()
        .select(
            raw(
                'distinct ("centsCustomers".id) as id, "storeCustomers"."businessId" as "businessId"',
            ),
        )
        .leftJoin('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
        .where((query) => {
            query
                .where('centsCustomers.phoneNumber', phoneNumber)
                .orWhere('storeCustomers.phoneNumber', phoneNumber);
        })
        .groupBy('centsCustomers.id', 'storeCustomers.businessId')
        .orderBy('businessId');
    isUser = centsCustomerId ? isUser.whereNot('centsCustomers.id', centsCustomerId) : isUser;
    isUser = await isUser;
    if (centsCustomerId && isUser.length) {
        // phone number is associaed with some other customer.
        resp.error = true;
        resp.message = 'Phone number already exists.';
    } else if (!centsCustomerId && isUser.length) {
        // check if customer exists in current business or not.
        const isBusinessCustomer = isUser.find((user) => user.businessId === businessId);
        if (isBusinessCustomer) {
            resp.error = true;
            resp.message = 'Phone number already exists.';
        } else {
            resp.error = false;
            resp.centsCustomerId = isUser[0].id;
        }
    } else {
        resp.error = false;
        resp.centsCustomerId = centsCustomerId;
    }
    return resp;
}

function typeValidations(body, isEdit) {
    const commonSchema = {
        email: Joi.string().email().allow(null, '').optional(),
        phoneNumber: Joi.string().required().min(1).max(16),
        languageId: Joi.number().integer().allow(null, '').optional(),
    };
    const editCustomerSchema = Joi.object().keys({
        id: Joi.number().required(),
        availableCredit: Joi.number().allow(null, ''),
        centsCustomerId: Joi.number().required(),
        language: Joi.string().allow(null, ''),
        notes: Joi.string().allow(null, ''),
        stripeCustomerId: Joi.string().allow(null, ''),
        fullName: Joi.string().optional(),
        firstName: Joi.string()
            .required()
            .error(() => 'First Name cannot be empty'),
        lastName: Joi.string()
            .required()
            .error(() => 'Last Name cannot be empty'),
        ...commonSchema,
    });
    const addCustomerSchema = Joi.object()
        .keys({
            fullName: Joi.string().required(),
            storeId: Joi.number().integer().optional(),
            ...commonSchema,
        })
        // must have only one between firstName , and fullName
        .xor('firstName', 'fullName')
        // firstname and lastname must always appear together
        .and('firstName', 'lastName')
        // firstname and lastname cannot appear together with fullname
        .without('fullName', ['firstName', 'lastName']);

    const validate = Joi.validate(body, isEdit ? editCustomerSchema : addCustomerSchema);
    return validate;
}

/**
 * Validate the incoming customer creation request.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function addEditCustomerValidations(req, res, next) {
    try {
        const isEdit = req.originalUrl.includes('/edit');
        const isTypeValid = typeValidations(req.body, isEdit);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.details[0].message,
            });
            return;
        }
        req.constants = req.constants || {};
        let businessId;
        const { email, phoneNumber, centsCustomerId } = req.body;
        if (req.currentStore) {
            businessId = req.currentStore.businessId;
        } else {
            const business = await getBusiness(req);
            businessId = business.id;
        }
        let isEmailValid = {};
        if (email) {
            isEmailValid =
                !isEdit && (await checkEmail(email, businessId, centsCustomerId, isEdit));
            if (isEmailValid.error) {
                res.status(409).json({
                    error: isEmailValid.message,
                });
                return;
            }
        }
        const currentCentsCustomerId = isEmailValid.centsCustomerId
            ? isEmailValid.centsCustomerId
            : centsCustomerId;
        const isPhoneNumberValid = await checkPhoneNumber(
            phoneNumber,
            businessId,
            currentCentsCustomerId,
        );
        if (isPhoneNumberValid.error) {
            res.status(409).json({
                error: isPhoneNumberValid.message,
            });
            return;
        }
        // appending meta data for further processing.
        if (email) {
            req.constants.isNew =
                !isEmailValid.centsCustomerId && !isPhoneNumberValid.centsCustomerId;
            req.constants.centsCustomerId =
                isEmailValid.centsCustomerId || isPhoneNumberValid.centsCustomerId;
        } else if (phoneNumber) {
            req.constants.isNew = !isPhoneNumberValid.centsCustomerId;
            req.constants.centsCustomerId = isPhoneNumberValid.centsCustomerId;
        }
        req.constants.businessId = businessId;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    addEditCustomerValidations,
    checkPhoneNumber,
};

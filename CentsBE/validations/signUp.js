const Joi = require('@hapi/joi');
const { raw } = require('objection');

const LaundromatBusiness = require('../models/laundromatBusiness');
const Role = require('../models/role');

const emailCheck = require('./signUpValidations/email');
const formatError = require('../utils/formatError');

function signUpValidation(inputs) {
    const validationSchema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email(),
        laundromatName: Joi.string().required(),
        userType: Joi.string().required(),
    });

    const inputObject = {
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        email: inputs.email,
        laundromatName: inputs.companyName,
        userType: inputs.userType,
    };

    const error = Joi.validate(inputObject, validationSchema);

    return error;
}

async function dbValidations(req, res, next) {
    try {
        const isValid = signUpValidation(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        /* Role validation. */
        const role = await Role.query().findOne('userType', req.body.userType);
        if (!role) {
            res.status(422).json({
                error: 'Role not found.',
            });
            return;
        }
        /* Email validation */
        const emailExist = await emailCheck(
            req.body.email.toUpperCase(),
            'Customer',
            'Business Owner',
        );
        if (emailExist.error) {
            res.status(409).json({
                error: emailExist.message,
            });
            return;
        }
        /* Business validation */
        const isBusiness = await LaundromatBusiness.query().where(
            raw('upper("name")'),
            req.body.companyName.toUpperCase(),
        );
        if (isBusiness.length) {
            res.status(409).json({
                error: 'Business name already exists.',
            });
            return;
        }

        if (emailExist.isNew) {
            req.isNew = emailExist.isNew;
        } else {
            req.userId = emailExist.userId;
        }
        req.roleId = role.id;
        next();
    } catch (error) {
        next(Error);
    }
}

module.exports = exports = dbValidations;

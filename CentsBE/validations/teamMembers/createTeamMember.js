const Joi = require('@hapi/joi');

const emailValidation = require('../signUpValidations/email');
const getBusiness = require('../../utils/getBusiness');
const formatError = require('../../utils/formatError');
const TeamMember = require('../../models/teamMember');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        employeeCode: Joi.number().required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function findTeamMember(businessId, employeeCode) {
    const teamMember = await TeamMember.query().findOne({
        businessId,
        employeeCode,
    });

    return teamMember;
}

async function validations(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        const business = await getBusiness(req);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const isUser = await emailValidation(req.body.email.toUpperCase(), 'Customer', 'Employee');
        if (isUser.error) {
            res.status(422).json({
                error: 'Email already exists.',
            });
            return;
        }

        const teamMember = await findTeamMember(business.id, req.body.employeeCode);
        if (teamMember) {
            res.status(422).json({
                error: 'The employee code you chose is already taken, please choose another one.',
            });
            return;
        }

        /* If the user is new */
        if (isUser.isNew) {
            req.isNew = isUser.isNew;
        } else {
            /* If user already exists. */
            req.userId = isUser.userId;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validations;

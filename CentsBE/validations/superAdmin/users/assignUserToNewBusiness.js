const Joi = require('@hapi/joi');

const User = require('../../../models/user');
const TeamMember = require('../../../models/teamMember');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        businessId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Determine the roles the current user has.
 *
 * If the user is currently an employee, a business owner, or a super admin,
 * then they should not be allowed to update their business.
 *
 * @param {Number} userId
 */
async function validateUserRole(userId) {
    const user = await User.query().withGraphFetched('roles').findById(userId);

    if (!user.roles) {
        return false;
    }

    const roles = user.roles.map((role) => role.userType);

    if (roles.includes('Employee', 'Business Owner', 'Super Admin')) {
        return false;
    }

    return true;
}

/**
 * Determine whether the user's employee code is currently taken for the business
 *
 * @param {Number} userId
 * @param {Number} businessId
 */
async function validateEmployeeCode(userId, businessId) {
    const user = await User.query().withGraphFetched('teamMember').findById(userId);
    const currentEmployeeCode = user.teamMember.employeeCode;
    const teamMembers = await TeamMember.query().where({
        businessId,
    });
    const employeeCodes = teamMembers.map((member) => member.employeeCode);

    if (employeeCodes.includes(currentEmployeeCode)) {
        return false;
    }

    return true;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { id } = req.params;
        const { businessId } = req.body;

        const hasValidRole = await validateUserRole(id);
        if (!hasValidRole) {
            res.status(409).json({
                error: 'You cannot change the business for a user if they are an Employee, Business Owner, or Super Admin',
            });
            return;
        }

        const employeeCodeAvailable = await validateEmployeeCode(id, businessId);
        if (!employeeCodeAvailable) {
            res.status(409).json({
                error: 'The employee code for this user is already taken at the business you are attempting to assign them to. You will need to change the employee code for this user to continue.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

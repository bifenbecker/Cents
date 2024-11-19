const Joi = require('@hapi/joi');

const User = require('../../../models/user');
const TeamMember = require('../../../models/teamMember');
const TeamMemberCheckIn = require('../../../models/teamMemberCheckIn');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        employeeCode: Joi.string().required(),
        businessId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Determine whether the incoming employee code is currently taken for the business
 *
 * @param {Number} userId
 * @param {Number} businessId
 * @param {String} employeeCode
 */
async function validateEmployeeCode(userId, businessId, employeeCode) {
    const user = await User.query().withGraphFetched('teamMember').findById(userId);
    const currentEmployeeCode = user.teamMember.employeeCode;
    const teamMembers = await TeamMember.query().where({
        businessId,
    });
    const employeeCodes = teamMembers.map((member) => member.employeeCode);

    if (employeeCodes.includes(employeeCode) && currentEmployeeCode !== employeeCode) {
        return false;
    }

    return true;
}

/**
 * Determine if the user you're changing is currently checked in or not
 *
 * @param {Number} userId
 * @param {String} employeeCode
 */
async function isEmployeeCheckedIn(userId, employeeCode) {
    const user = await User.query().withGraphFetched('teamMember').findById(userId);
    const { teamMember } = user;
    const checkedIn = await TeamMemberCheckIn.query().where({
        teamMemberId: teamMember.id,
        checkOutTime: null,
    });
    if (checkedIn.length > 0 && teamMember.employeeCode !== employeeCode) {
        return true;
    }

    return false;
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
        const { businessId, employeeCode } = req.body;

        const employeeCodeAvailable = await validateEmployeeCode(id, businessId, employeeCode);
        if (!employeeCodeAvailable) {
            res.status(409).json({
                error: 'This employee code is already taken by someone else. Please choose a different employee code.',
            });
            return;
        }

        const checkedIn = await isEmployeeCheckedIn(id, employeeCode);
        if (checkedIn) {
            res.status(422).json({
                error: 'This employee is currently checked in somewhere. To change the employee code, the employee needs to check out first.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

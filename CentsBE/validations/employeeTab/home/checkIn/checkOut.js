const Joi = require('@hapi/joi');
const isCheckedIn = require('./isCheckedIn');

const TeamMember = require('../../../../models/teamMember');
const TeamMemberStore = require('../../../../models/teamMemberStore');

async function validateRequest(req, res, next) {
    try {
        const schema = Joi.object().keys({
            employeeCode: Joi.number().integer().required(),
        });

        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        // if user exits and is an employee.

        const teamMember = await TeamMember.query().findOne({
            employeeCode: req.body.employeeCode,
            businessId: req.currentStore.businessId,
        });
        if (!teamMember) {
            res.status(400).json({
                error: 'Invalid employee code',
            });
            return;
        }
        // if the user is associated with the current store.
        const isStore = await TeamMemberStore.query().findOne({
            teamMemberId: teamMember.id,
            storeId: req.currentStore.id,
        });

        if (!isStore) {
            const user = await teamMember.getUser();
            const roles = await user.getRoles();
            if (roles && roles[0].roleName() !== 'owner') {
                res.status(400).json({
                    error: 'You are not authorized to check-out in at this store.',
                });
                return;
            }
        }
        // if the user is already checked in.
        const isEmployeeCheckedIn = await isCheckedIn(teamMember.id, req.currentStore.id, false);
        if (isEmployeeCheckedIn.error) {
            if (!isEmployeeCheckedIn.address) {
                res.status(409).json({
                    error: isEmployeeCheckedIn.message,
                });
                return;
            }
        }
        req.teamMemberId = teamMember.id;
        req.businessId = req.currentStore.businessId;
        req.previousStoreId = isEmployeeCheckedIn.previousStore;
        req.userId = teamMember.userId;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

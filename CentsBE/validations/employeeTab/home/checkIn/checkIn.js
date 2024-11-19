const Joi = require('@hapi/joi');
const isCheckedIn = require('./isCheckedInOut');
const validateEmployeeCode = require('../../../validateEmployeeCode');
const TeamMember = require('../../../../models/teamMember');

async function validateRequest(req, res, next) {
    try {
        const schema = Joi.object().keys({
            employeeCode: Joi.number().integer().required(),
        });

        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }

        await validateEmployeeCode(
            req.body.employeeCode,
            req.currentStore.businessId,
            req.currentStore.id,
        );
        // if user exits and is an employee.
        const teamMember = await TeamMember.query().findOne({
            employeeCode: req.body.employeeCode,
            businessId: req.currentStore.businessId,
        });
        // if teamMember is archived
        if (teamMember.isDeleted) {
            res.status(403).json({
                error: 'User not found',
            });
            return;
        }
        // if the user is already checked in.
        const isEmployeeCheckedIn = await isCheckedIn(teamMember.id, req.currentStore.id, false);
        if (isEmployeeCheckedIn.error) {
            res.status(409).json({
                address: isEmployeeCheckedIn.address,
                error: isEmployeeCheckedIn.message,
            });
            return;
        }
        req.teamMemberId = teamMember.id;
        req.userId = teamMember.userId;
        req.isCheckedIn = isEmployeeCheckedIn.isCheckedIn;
        req.sameStoreCheckout = isEmployeeCheckedIn.sameStoreCheckOut;
        req.storeId = isEmployeeCheckedIn.storeId;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

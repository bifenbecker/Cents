const Joi = require('@hapi/joi');
const TeamMembersCheckIn = require('../../models/teamMemberCheckIn');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        checkInTime: Joi.date().required().not(null, ''),
        checkOutTime: Joi.date().required().not(null, ''),
        logId: Joi.number().integer().min(1).required(),
        teamMemberId: Joi.number().integer().min(1).required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validations(req, res, next) {
    try {
        const { id, teamMemberId } = req.params;
        const isValid = typeValidations({ ...req.body, teamMemberId, logId: id });
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        if (Date.parse(req.body.checkOutTime) <= Date.parse(req.body.checkInTime)) {
            res.status(422).json({
                error: 'checkInTime should be less than checkOutTime',
            });
            return;
        }
        const activeLog = await TeamMembersCheckIn.query()
            .select('*')
            .whereNot('id', id)
            .andWhere('teamMemberId', teamMemberId)
            .andWhere('checkInTime', '<=', req.body.checkOutTime)
            .andWhere('checkInTime', '>=', req.body.checkInTime)
            .andWhere('checkOutTime', null);
        if (activeLog.length) {
            res.status(422).json({
                error: 'cannot update because team member is active around these times',
            });
            return;
        }
        const activeLogInBetween = await TeamMembersCheckIn.query()
            .select('*')
            .whereNot('id', id)
            .andWhere('teamMemberId', teamMemberId)
            .andWhere('checkInTime', '<=', req.body.checkOutTime)
            .andWhere('checkInTime', '<=', req.body.checkInTime)
            .andWhere('checkOutTime', null);
        if (activeLogInBetween.length) {
            res.status(422).json({
                error: 'cannot update because team member is active around these times',
            });
            return;
        }
        const CheckInOutLogs = await TeamMembersCheckIn.query()
            .select('*')
            .whereNot('id', id)
            .andWhere('teamMemberId', teamMemberId)
            .andWhere('checkInTime', '>=', req.body.checkInTime)
            .andWhere('checkOutTime', '<=', req.body.checkOutTime);

        if (CheckInOutLogs.length) {
            res.status(422).json({
                error: 'over lapping found in both checkIn and checkOut times',
            });
            return;
        }

        const checkInLogs = await TeamMembersCheckIn.query()
            .select('*')
            .whereNot('id', id)
            .andWhere('teamMemberId', teamMemberId)
            .andWhere('checkInTime', '<=', req.body.checkInTime)
            .andWhere('checkOutTime', '>=', req.body.checkInTime);

        const checkOutLogs = await TeamMembersCheckIn.query()
            .select('*')
            .whereNot('id', id)
            .andWhere('teamMemberId', teamMemberId)
            .andWhere('checkInTime', '<=', req.body.checkOutTime)
            .andWhere('checkOutTime', '>=', req.body.checkOutTime);

        if (checkInLogs.length && checkOutLogs.length) {
            res.status(422).json({
                error: 'over lapping found in both checkIn and checkOut times',
            });
            return;
        }
        if (checkInLogs.length) {
            res.status(422).json({
                error: 'over lapping found in checkInTime',
            });
            return;
        }
        if (checkOutLogs.length) {
            res.status(422).json({
                error: 'over lapping found in checkOutTime',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validations;

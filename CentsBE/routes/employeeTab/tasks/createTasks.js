const { transaction } = require('objection');
const Joi = require('@hapi/joi');
const TaskLogs = require('../../../models/taskLogs');
const TeamMember = require('../../../models/teamMember');
const Tasks = require('../../../models/tasks');

function validateParams(inputObj) {
    const schema = Joi.object().keys({
        taskId: Joi.number().integer().required(),
        timingsId: Joi.number().integer().required(),
        notes: Joi.string().optional().allow(null, ''),
        employeeCode: Joi.string().optional().allow(null),
        completedAt: Joi.string().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function completeTask(req, res, next) {
    let trx = null;
    try {
        const { employeeCode, taskId, notes, completedAt, timingsId } = req.body;
        const isValid = validateParams(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { requiresEmployeeCode } = req.currentStore.settings;
        if (requiresEmployeeCode) {
            if (!req.body.employeeCode) {
                res.status(422).json({
                    error: 'Employee Code is required.',
                });
                return;
            }
        }
        const { businessId } = req.currentStore;
        const teamMemberId = await TeamMember.query().select('id').findOne({
            businessId,
            employeeCode,
        });
        trx = await transaction.start(TaskLogs.knex());
        const taskDetails = await Tasks.query(trx).findById(taskId);
        await TaskLogs.query(trx).insert({
            teamMemberId: teamMemberId ? teamMemberId.id : null,
            taskDetails,
            notes: notes || null,
            taskTimingId: timingsId,
            completedAt,
        });
        trx.commit();
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = completeTask;

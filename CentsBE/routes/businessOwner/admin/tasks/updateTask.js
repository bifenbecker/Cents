const { transaction } = require('objection');

const Task = require('../../../../models/tasks');
const TaskTimings = require('../../../../models/taskTimings');

const { mapTimingsAndTask } = require('./createTask');
const getTaskDetails = require('../../../../utils/getSingleTaskDetails');

module.exports = exports = async function updateTask(req, res, next) {
    let trx = null;
    try {
        const taskId = req.body.id;
        trx = await transaction.start(Task.knex());
        await Task.query(trx)
            .patch({
                name: req.body.name,
                description: req.body.description,
                isPhotoNeeded: false,
                businessId: req.business.id,
            })
            .findById(taskId);

        await TaskTimings.query(trx)
            .patch({
                isDeleted: true,
                deletedAt: new Date(),
            })
            .where('taskId', taskId);
        await TaskTimings.query(trx).insert(mapTimingsAndTask(taskId, req.timings));

        await trx.commit();
        const taskDetails = await getTaskDetails(taskId);
        res.status(200).json({
            success: true,
            task: taskDetails.rows[0],
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};

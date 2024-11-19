const { transaction } = require('objection');

const Task = require('../../../../models/tasks');
const TaskTimings = require('../../../../models/taskTimings');

const getTaskDetails = require('../../../../utils/getSingleTaskDetails');

function mapTimingsAndTask(taskId, timings) {
    const taskTimings = timings.map((timing) => {
        const mappedTiming = {
            timingsId: timing.id,
            taskId,
        };
        return mappedTiming;
    });
    return taskTimings;
}

async function createTask(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(Task.knex());

        const task = await Task.query(trx)
            .insert({
                name: req.body.name,
                description: req.body.description,
                isPhotoNeeded: false,
                businessId: req.business.id,
            })
            .returning('*');

        await TaskTimings.query(trx).insert(mapTimingsAndTask(task.id, req.timings));

        await trx.commit();
        const taskDetails = await getTaskDetails(task.id);
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
}

module.exports = exports = {
    createTask,
    mapTimingsAndTask,
};

const Task = require('../../../../models/tasks');

const archiveModelPipeline = require('../../../../pipeline/archive/archiveModelPipeline');

/**
 * Archive a given task
 *
 * @param {Object} req
 * @param {Objct} res
 * @param {void} next
 */
async function archiveTask(req, res, next) {
    try {
        const { id } = req.params;
        const { archiveBoolean } = req.body;

        const payload = {
            modelName: Task,
            modelId: id,
            archiveBoolean,
        };

        const output = await archiveModelPipeline(payload);

        return res.json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = archiveTask;

const { raw } = require('objection');
const Task = require('../../../../models/tasks');
const getBusiness = require('../../../../utils/getBusiness');

async function getTasks(req, res, next) {
    try {
        const { page } = req.query;
        const business = await getBusiness(req);
        let tasks = Task.query()
            .select('tasks.id', 'tasks.name', raw('count(tasks.id) over() as total_tasks'))
            .where('tasks.businessId', business.id);
        tasks = Number(page) > 0 ? tasks.limit(20).offset(Number(page - 1) * 20) : tasks;
        tasks = await tasks.orderBy('name');
        res.status(200).json({
            success: true,
            tasks,
            totalCount: tasks.length ? tasks[0].total_tasks : 0,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getTasks;

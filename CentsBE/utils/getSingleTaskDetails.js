const Task = require('../models/tasks');

module.exports = exports = async function getTaskDetails(taskId) {
    try {
        const details = await Task.knex().raw(`
        SELECT 
            tasks.id,
            tasks.name,
            tasks.description,
            tasks."isPhotoNeeded",
            (SELECT ARRAY_AGG(DISTINCT stores.id) as "assignedLocations"
                from "taskTimings"
                JOIN timings ON "taskTimings"."timingsId" = timings.id
                JOIN shifts ON "timings"."shiftId" = shifts.id
                JOIN stores ON "shifts"."storeId" = stores.id
                where "taskTimings"."taskId" = tasks.id
                and "taskTimings"."isDeleted" = false
                group by "taskTimings"."taskId"
            ),
            (
                SELECT ARRAY_AGG(DISTINCT timings.day::INTEGER) as "assignedDays"
                from "taskTimings"
                JOIN timings ON "taskTimings"."timingsId" = timings.id
                where "taskTimings"."taskId" = tasks.id
                and "taskTimings"."isDeleted" = false
                group by "taskTimings"."taskId"
            ),
            (
                SELECT ARRAY_AGG(DISTINCT shifts.name) as "assignedShifts"
                from "taskTimings"
                JOIN timings ON "taskTimings"."timingsId" = timings.id
                JOIN shifts ON "timings"."shiftId" = shifts.id
                where "taskTimings"."taskId" = tasks.id
                and "taskTimings"."isDeleted" = false
                group by "taskTimings"."taskId"
            )
            
        FROM tasks
        where "tasks"."id" = ${taskId}
    `);
        return details;
    } catch (error) {
        throw new Error(error);
    }
};

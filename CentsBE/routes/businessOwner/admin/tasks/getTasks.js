const Shift = require('../../../../models/shifts');
const Task = require('../../../../models/tasks');
const getBusiness = require('../../../../utils/getBusiness');

module.exports = exports = async (req, res, next) => {
    try {
        const withArchived = req.query.withArchived === 'true';
        const business = await getBusiness(req);
        const taskDetails = await Task.knex().raw(`
                SELECT 
                    tasks.id,
                    tasks.name,
                    tasks.description,
                    tasks."isPhotoNeeded",
                    tasks."deletedAt",
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
                        where "taskTimings"."taskId" = tasks.id and
                        "taskTimings"."isDeleted" = false
                        group by "taskTimings"."taskId"
                    )
                    
                FROM tasks
                where "tasks"."businessId" = ${business.id} ${
            !withArchived ? 'AND "tasks"."deletedAt" IS NULL' : ''
        }
                order by tasks.name
            `);
        const allShift = await Shift.query().distinct('name').select('name').where('type', 'SHIFT');

        for (const task of taskDetails.rows) {
            task.assignedShifts = allShift.map((shift) => {
                if (task.assignedShifts.includes(shift.name)) {
                    return {
                        name: shift.name,
                        isAssigned: true,
                    };
                }

                return {
                    name: shift.name,
                    isAssigned: false,
                };
            });
        }

        res.status(200).json({
            success: true,
            tasks: taskDetails.rows,
            needsRegions: business.needsRegions,
        });
    } catch (error) {
        next(error);
    }
};

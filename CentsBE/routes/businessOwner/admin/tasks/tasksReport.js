const momenttz = require('moment-timezone');
const Stores = require('../../../../models/store');
const getBusiness = require('../../../../utils/getBusiness');
const { weekMapping } = require('../../../../constants/constants');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

async function getTasksReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, userTz } = req.query;
        if (!business) {
            const errMsg = 'Invalid request. No business exists';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }
        const timeZone = userTz || 'UTC';
        const Details = await Stores.knex().raw(`
        select * from(
            with time_series_data AS(
                SELECT date_trunc('day', dd):: date as date, extract(isodow from dd)::text as t_day
                FROM generate_series
                    ( '${startDate}'::timestamp 
                    , '${endDate}'::timestamp
                    , '1 day'::interval) dd
            )
            select distinct (shifts.id), stores.name as Location,
                    to_char(tasks."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'DD/MM/YYYY') as "createdDate",
                    to_char("taskLogs"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'DD/MM/YYYY') as "completedDate",
                    shifts.name as Shift,
                    tasks.name as Task, "tasks".id as task_id, timings.day, time_series_data.date, "taskLogs"."completedAt",
                    ROW_NUMBER() OVER(partition by "tasks".id, timings.id, timings.day, time_series_data.date, shifts.id order by "taskLogs"."completedAt"),
                    tasks.description as "TaskDescription", tasks.id as "taskId",
                    case when "taskLogs"."completedAt" is null then 'incomplete' else 'completed' end as "Status",
                    CONCAT (users."firstname",' ',users."lastname") as "Employee",
                    to_char(tasks."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM') as "createdTime",
                    to_char("taskLogs"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'HH12:MI AM') as "completedTime",
                    "taskLogs"."notes" as Note
                    from stores
                    inner join shifts on shifts."storeId" = stores.id
                    inner join "storeSettings" on "storeSettings"."storeId" = stores.id
                    inner join timings on timings."shiftId" = shifts.id
                    inner join "taskTimings" on "taskTimings"."timingsId" = "timings".id
                    inner join "tasks" on tasks.id = "taskTimings"."taskId" and tasks."businessId" = ${business.id} 
                    inner join time_series_data ON time_series_data.t_day = timings.day
                    left join "taskLogs" on "taskLogs"."taskTimingId" = "taskTimings".id
                    AND "taskLogs".id = (
                                SELECT tl.id
                                FROM "taskLogs" tl 
                                WHERE tl."taskTimingId" = "taskTimings".id AND time_series_data.date = DATE("taskLogs"."completedAt")
                                order by tl."completedAt" desc limit 1)
                    left join "teamMembers" on "teamMembers".id = "taskLogs"."teamMemberId" 
                    left join "users" on "users".id = "teamMembers"."userId" 
                    where ((CAST("tasks"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${startDate}' and '${endDate}') or (CAST("taskLogs"."completedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${startDate}' and '${endDate}'))
                   order by "Status" asc, "completedAt" desc
            ) as sub
            where row_number=1
        `);
        const data = [
            [
                'Location',
                'createdDate',
                'createdTime',
                'Day',
                'Date',
                'Shift',
                'Task',
                'Task Description',
                'Status',
                'Employee',
                'completedDate',
                'completedTime',
                'Note',
            ],
        ];
        const result = Details.rows;
        result.forEach((a) => {
            const {
                location,
                createdDate,
                completedDate,
                day,
                shift,
                task,
                TaskDescription,
                Status,
                Employee,
                createdTime,
                completedTime,
                note,
            } = a;
            const date = momenttz(a.date).tz(timeZone).format('MM/DD/YYYY');
            data.push([
                location,
                createdDate,
                createdTime,
                weekMapping[day],
                date,
                shift,
                task,
                TaskDescription,
                Status,
                Employee,
                completedDate,
                completedTime,
                note,
            ]);
        });
        return res.status(200).send(data);
    } catch (error) {
        return next(error);
    }
}

module.exports = getTasksReport;

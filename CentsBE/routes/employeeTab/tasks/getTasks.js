const Tasks = require('../../../models/tasks');

function mapResponse(shiftData) {
    const shift = {
        hasShift: false,
    };
    Object.values(shiftData).map((ele) => {
        const ele1 = ele;
        if (shift.tasks) {
            delete ele1.shift;
            delete ele1.startTime;
            delete ele1.endTime;
            delete ele1.startDay;
            shift.tasks.push(ele);
        } else {
            shift.shift = ele.shift;
            shift.startTime = ele.startTime;
            shift.endTime = ele.endTime;
            shift.startDay = ele.startDay;
            delete ele1.shift;
            delete ele1.startTime;
            delete ele1.endTime;
            delete ele1.startDay;
            shift.tasks = [];
            shift.hasShift = true;
            shift.tasks.push(ele);
        }
        return null;
    });
    return shift;
}
async function getTasks(req, res, next) {
    try {
        const storeId = req.currentStore.id;
        const { currentDay, currentTime } = req.query;
        const shiftInfo = await Tasks.knex().raw(`
        select distinct(shifts.id),
        tasks.id, shifts.name as shift, "taskTimings".id as "timingsId",
        CONCAT (users."firstname",' ',users."lastname") as "Employee",
        "taskLogs".notes,
        to_char("taskLogs"."completedAt" AT TIME ZONE 'UTC', 'HH12:MI AM') as "completedAt",
        timings."startTime", timings."endTime", timings.day as "startDay",
        tasks.name,tasks.id, tasks.description, tasks.url, tasks."isPhotoNeeded",
        case when "taskLogs"."completedAt" is null then false else (
        case when ("taskLogs"."completedAt" at time zone 'UTC')
        BETWEEN
        case when timings."endTime"::date = '1970-01-02' then
        ('${currentTime}'::date - interval '1 day') + (timings."startTime" at time zone 'UTC')::time else
        ('${currentTime}'::date) + (timings."startTime" at time zone 'UTC')::time end    
            AND
        ('${currentTime}'::date) + (timings."endTime" at time zone 'UTC')::time
        then true
        else false
        end
        ) end as "isComplete"
        from tasks
        inner join "taskTimings" on "taskTimings"."taskId" = "tasks".id
        inner join "timings" on "timings"."id" = "taskTimings"."timingsId"
        inner join "shifts" on "shifts".id = "timings"."shiftId"
        inner join "stores" on "stores".id = "shifts"."storeId"
        left join "taskLogs" on "taskLogs"."taskTimingId" = "taskTimings".id 
            and "taskLogs"."completedAt" between ((('${currentTime}' at TIME ZONE 'UTC') :: date ) + timings."startTime"::time) 
            and ((('${currentTime}' at TIME ZONE 'UTC') :: date ) + INTERVAL '1 day')
        left join "teamMembers" on "teamMembers".id = "taskLogs"."teamMemberId" 
        left join "users" on "users".id = "teamMembers"."userId" 
        where  ('${currentTime}' at time zone 'UTC')::time between (timings."startTime"::time  + interval '1 second')
        and timings."endTime"::time
        and "timings".day = '${currentDay}' and stores.id = ${storeId}
        and "taskTimings"."isDeleted" = false
        and tasks."deletedAt" IS NULL
        group by shifts.id, shifts.name, "taskTimings".id,
        timings."startTime",timings.day, timings."endTime", tasks.id,
        users."firstname",users."lastname","taskLogs".notes,"taskLogs"."completedAt",
        tasks.name, tasks.id, tasks.description,
        tasks.url, tasks."isPhotoNeeded"
        `);
        const result = mapResponse(shiftInfo.rows);
        res.status(200).json({
            ...result,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = getTasks;

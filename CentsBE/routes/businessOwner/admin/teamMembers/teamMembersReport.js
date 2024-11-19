const { raw } = require('objection');
const momenttz = require('moment-timezone');
const User = require('../../../../models/user');
const getBusiness = require('../../../../utils/getBusiness');
const { getFormattedStartAndEndDates } = require('../../../../utils/reports/reportsUtils');

async function teamMembersReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate } = req.query;
        const { userTz } = req.query;
        const { team } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            userTz,
        );

        const teamMembers = await User.query()
            .select(
                raw(
                    'users.firstname || \' \'|| users.lastname as "fullName",(case when ("teamMembersCheckIn"."checkOutTime" is not null)then to_char((EXTRACT(EPOCH from "teamMembersCheckIn"."checkOutTime" - "teamMembersCheckIn"."checkInTime")::text)::interval,\'HH24:MI\') end) as "Duration"',
                ),
                raw(
                    '(case when ("teamMembersCheckIn"."checkOutTime" is not null) then EXTRACT(EPOCH from "teamMembersCheckIn"."checkOutTime" - "teamMembersCheckIn"."checkInTime") / 60 end) AS "minutesDuration"',
                ),
                'teamMembersCheckIn.id as checkedIn',
                'stores.name as storeName',
                'teamMembersCheckIn.checkInTime',
                'teamMembersCheckIn.checkOutTime',
                'teamMembers.employeeCode as employeeCode',
                'storeSettings.timeZone as timeZone',
            )
            .join('teamMembers', 'teamMembers.userId', 'users.id')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', 'teamMembers.id')
            .join('stores', 'stores.id', 'teamMembersCheckIn.storeId')
            .join('storeSettings', 'storeSettings.storeId', 'stores.id')
            .where('teamMembers.businessId', business.id)
            .whereIn('teamMembers.id', team)
            .whereRaw(
                `CAST("teamMembersCheckIn"."checkInTime" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .orderBy('teamMembers.employeeCode', 'asc')
            .orderBy('teamMembersCheckIn.checkInTime', 'desc');
        const data = [
            [
                'Employee Code',
                'Employee Name',
                'Check-in Date',
                'Check-in Time',
                'Check-out Date',
                'Check-out Time',
                'Duration',
                'Duration (Minutes)',
                'Store',
            ],
        ];
        teamMembers.forEach((a) => {
            const Store = a.storeName;
            const { employeeCode } = a;
            const { fullName } = a;
            const { Duration } = a;
            const { minutesDuration } = a;
            const checkInDate = a.checkInTime
                ? momenttz(a.checkInTime)
                      .tz(a.timeZone || 'UTC')
                      .format('MM-DD-YYYY')
                : '-';
            const checkInTime = a.checkInTime
                ? momenttz(a.checkInTime)
                      .tz(a.timeZone || 'UTC')
                      .format('hh:mm A z')
                : '-';
            const checkOutDate = a.checkOutTime
                ? momenttz(a.checkOutTime)
                      .tz(a.timeZone || 'UTC')
                      .format('MM-DD-YYYY')
                : '-';
            const checkOutTime = a.checkOutTime
                ? momenttz(a.checkOutTime)
                      .tz(a.timeZone || 'UTC')
                      .format('hh:mm A z')
                : '-';

            data.push([
                employeeCode,
                fullName,
                checkInDate,
                checkInTime,
                checkOutDate,
                checkOutTime,
                Duration,
                Number(Number(minutesDuration).toFixed(2)),
                Store,
            ]);
        });
        res.status(200).send(data);
    } catch (error) {
        next(error);
    }
}

module.exports = teamMembersReport;

const TeamMemberCheckIn = require('../../../../models/teamMemberCheckIn');

async function teamMembersLogInsights(req, res, next) {
    try {
        const { id } = req.params;
        const { timeZone } = req.query;
        let thisWeek = 0;
        let thisMonth = 0;
        const logInsights = await TeamMemberCheckIn.query()
            .knex()
            .raw(
                `
            select 
            to_char( (sum (
                case when ("teamMembersCheckIn"."checkInTime" at time zone '${timeZone || 'UTC'}')
                 >= (date_trunc('week', current_date) - interval '1 day')
                and "teamMembersCheckIn"."checkOutTime" is not null
                then (EXTRACT (EPOCH FROM  "teamMembersCheckIn"."checkOutTime" - "teamMembersCheckIn"."checkInTime")) 
                else 0 end)::text)::interval,'HH24:MI') as "thisWeek",
            to_char( (sum (
                case when ("teamMembersCheckIn"."checkInTime" at time zone '${timeZone || 'UTC'}')
                 >= (date_trunc('month', current_date)) 
                and "teamMembersCheckIn"."checkOutTime" is not null
                then (EXTRACT (EPOCH FROM  "teamMembersCheckIn"."checkOutTime" - "teamMembersCheckIn"."checkInTime"))
                else 0 end)::text)::interval,'HH24:MI') as"thisMonth"
            from "teamMembersCheckIn" where "teamMemberId" = ${id}`,
            );
        thisWeek = logInsights.rows[0].thisWeek;
        thisMonth = logInsights.rows[0].thisMonth;
        res.status(200).json({
            success: true,
            thisWeek,
            thisMonth,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = teamMembersLogInsights;

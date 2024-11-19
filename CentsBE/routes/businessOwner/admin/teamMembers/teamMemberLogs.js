const { raw } = require('objection');
const TeamMemberLogs = require('../../../../models/teamMemberCheckIn');

const mapResponse = (log) => {
    const response = {};
    response.id = log.id;
    response.teamMemberId = log.teamMemberId;
    response.storeId = log.storeId;
    response.shiftId = log.shiftId;
    response.checkInTime = log.checkInTime;
    response.checkOutTime = log.checkOutTime;
    return response;
};

async function teamMembersLogs(req, res, next) {
    try {
        const { page } = req.query;
        const { id } = req.params;
        let logs = TeamMemberLogs.query()
            .select(
                raw('count(id) over () as "totalCount"'),
                'id',
                'teamMemberId',
                'storeId',
                'shiftId',
                'isCheckedIn',
                'checkInTime',
                'checkOutTime',
            )
            .where('teamMemberId', id);

        logs = Number(page) > 0 ? logs.limit(20).offset((Number(page) - 1) * 20) : logs;
        logs = await logs.orderBy('checkInTime', 'DESC');
        const totalCount = logs.length ? logs[0].totalCount : 0;
        logs = logs.map((log) => mapResponse(log));

        res.status(200).json({
            success: true,
            logs,
            totalCount: Number(totalCount),
            currentPage: page ? Number(page) : 1,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = teamMembersLogs;

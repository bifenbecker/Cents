const TeamMemberCheckIn = require('../../../../models/teamMemberCheckIn');

async function updateLogs(req, res, next) {
    try {
        const { id } = req.params;
        const { checkInTime, checkOutTime } = req.body;
        const updatedLogs = await TeamMemberCheckIn.query()
            .patch({
                checkInTime,
                checkOutTime,
                isCheckedIn: false,
            })
            .findById(id);
        res.status(200).json({
            success: true,
            updatedLogs,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateLogs;

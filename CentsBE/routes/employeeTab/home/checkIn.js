const { raw } = require('objection');
const TeamMembersCheckIn = require('../../../models/teamMemberCheckIn');
const User = require('../../../models/user');

async function checkIn(req, res, next) {
    try {
        const { teamMemberId, userId, isCheckedIn } = req;
        if (!isCheckedIn) {
            await TeamMembersCheckIn.query()
                .insert({
                    teamMemberId,
                    storeId: req.currentStore.id,
                    checkInTime: new Date().toISOString(),
                    isCheckedIn: true,
                })
                .returning('*');
        }
        const user = await User.query()
            .select(raw('users.firstname || \' \'|| users.lastname as "fullName"'))
            .findById(userId);
        res.status(200).json({
            success: true,
            fullName: user.fullName,
            isCheckedIn: !isCheckedIn,
            storeId: req.currentStore.id,
            sameStoreCheckOut: req.sameStoreCheckout,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = checkIn;

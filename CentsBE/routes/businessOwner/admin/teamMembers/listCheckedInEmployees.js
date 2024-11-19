const { raw } = require('objection');
const User = require('../../../../models/user');

async function listCheckedInEmployees(req, res, next) {
    try {
        const storeId = req.query['0'];
        let fullnames = await User.query()
            .select(raw('users.firstname || \' \'|| users.lastname as "fullName"'))
            .join('teamMembers', 'teamMembers.userId', '=', 'users.id')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', '=', 'teamMembers.id')
            .where('isCheckedIn', true)
            .where('storeId', storeId);
        fullnames = fullnames.map((props) => props.fullName);
        res.status(200).json({
            success: true,
            fullnames,
        });
    } catch (err) {
        next(err);
    }
}
module.exports = exports = listCheckedInEmployees;

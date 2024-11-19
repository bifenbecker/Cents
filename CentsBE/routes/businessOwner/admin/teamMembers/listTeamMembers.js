const { raw } = require('objection');
const TeamMember = require('../../../../models/teamMember');

const getBusiness = require('../../../../utils/getBusiness');

const mapResponse = (teamMember) => {
    const response = {};
    response.id = teamMember.id;
    response.userId = teamMember.userId;
    response.fullName = teamMember.fullName;
    response.isDeleted = teamMember.isDeleted;
    return response;
};

async function listTeamMembers(req, res, next) {
    try {
        const { page } = req.query;
        const business = await getBusiness(req);
        let teamMembers = TeamMember.query()
            .select(
                'teamMembers.id as id',
                'teamMembers.isDeleted as isDeleted',
                raw('users.firstname || \' \'|| users.lastname as "fullName"'),
                raw('count("teamMembers".id) over() as total_count'),
            )
            .join('users', 'users.id', 'teamMembers.userId')
            .where('teamMembers.businessId', business.id);
        teamMembers =
            Number(page) > 0 ? teamMembers.limit(20).offset((Number(page) - 1) * 20) : teamMembers;
        teamMembers = await teamMembers.orderByRaw('"fullName" asc');
        const totalCount = teamMembers.length ? Number(teamMembers[0].total_count) : 0;

        teamMembers = teamMembers.map((teamMember) => mapResponse(teamMember));

        res.status(200).json({
            success: true,
            teamMembers,
            totalCount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = listTeamMembers;

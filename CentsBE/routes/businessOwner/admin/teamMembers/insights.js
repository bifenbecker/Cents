const { raw } = require('objection');

const OrderActivityLog = require('../../../../models/orderActivityLog');
const TeamMember = require('../../../../models/teamMember');
const getBusiness = require('../../../../utils/getBusiness');

/**
 * @description Insights of team member
 *  Tickets Created (#) - hardcode 0 for now
 *  Orders Processed (#)
 */

async function getInsights(req, res, next) {
    try {
        const { id } = req.params;
        if (!id || !Number(id) || Number(id) < 1) {
            res.status(422).json({
                error: 'Id of type number greater than 1 is required.',
            });
            return;
        }
        const business = await getBusiness(req);
        const isTeamMember = await TeamMember.query().findOne({
            userId: id,
            businessId: business.id,
        });
        if (!isTeamMember) {
            res.status(404).json({
                error: 'Team member not found.',
            });
            return;
        }
        const orderProcessedCount = await OrderActivityLog.query()
            .select(raw('count(distinct "orderActivityLog"."orderId") as "ordersProcessed"'))
            .join('teamMembers', 'teamMembers.id', 'orderActivityLog.teamMemberId')
            .where('teamMembers.userId', id);

        res.status(200).json({
            success: true,
            insights: {
                ticketsCreated: 0,
                ordersProcessed: Number(orderProcessedCount[0].ordersProcessed),
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInsights;

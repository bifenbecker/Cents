const runMachinePipeline = require('../../../../pipeline/machines/runMachinePipeline');
const { serviceTypes } = require('../../../../constants/constants');
const {
    getServiceOrderTurnDetails,
} = require('../../../../uow/machines/getServiceOrderTurnsDetailsUow');

const createFullServiceTurn = async (req, res, next) => {
    try {
        const { userId, teamMemberId } = req.body;
        const { serviceOrderId } = req.params;
        const payload = {
            ...req.body,
            ...req.constants,
            userId,
            teamMemberId,
            serviceOrderId,
            serviceType: serviceTypes.FULL_SERVICE,
        };
        const result = await runMachinePipeline(payload);
        result.turnDetails = await getServiceOrderTurnDetails(result);
        return res.json({
            success: true,
            result,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createFullServiceTurn,
};

const runMachinePipeline = require('../../../../pipeline/machines/runMachinePipeline');
const eventEmitter = require('../../../../config/eventEmitter');

const createTurn = async (req, res, next) => {
    try {
        const { userId, teamMemberId } = req.body;
        const payload = {
            ...req.body,
            machineId: req.params.id,
            ...req.constants,
            userId,
            teamMemberId,
        };
        const result = await runMachinePipeline(payload);
        const { turnId } = result;
        eventEmitter.emit('turnCreated', { turnId });
        return res.json({
            success: true,
            result,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createTurn,
};

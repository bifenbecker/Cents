const getServiceOrderTurnListPipeline = require('../../../../pipeline/machines/getServiceOrderTurnsListPipeline');

async function getServiceOrderTurnList(req, res, next) {
    try {
        const payload = {
            ...req.params,
            ...req.query,
        };
        const output = await getServiceOrderTurnListPipeline(payload);
        res.status(200).json({
            success: true,
            turn: output,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getServiceOrderTurnList;

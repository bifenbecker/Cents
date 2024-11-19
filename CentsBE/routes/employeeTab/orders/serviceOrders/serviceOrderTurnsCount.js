const getServiceOrderTurnsCountPipeline = require('../../../../pipeline/machines/getServiceOrderTurnsCountPipeline');

async function getServiceOrderTurnsCount(req, res, next) {
    try {
        const payload = {
            ...req.params,
        };
        const output = await getServiceOrderTurnsCountPipeline(payload);
        res.status(200).json({
            success: true,
            ...output,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getServiceOrderTurnsCount;

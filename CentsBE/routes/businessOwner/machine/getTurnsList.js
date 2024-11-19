const getTurnListPipeline = require('../../../pipeline/machines/getTurnsListPipeline');

async function getTurnsList(req, res, next) {
    try {
        const payload = {
            ...req.params,
            ...req.query,
        };
        const output = await getTurnListPipeline(payload);
        res.status(200).json({
            success: true,
            ...output,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getTurnsList;

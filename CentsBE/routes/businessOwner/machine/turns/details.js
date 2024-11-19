const getTurnDetailsPipeline = require('../../../../pipeline/machines/turnDetails');

async function getTurnDetails(req, res, next) {
    try {
        const { turnId } = req.params;
        const payload = { turnId };
        const output = await getTurnDetailsPipeline(payload);
        res.status(200).json({
            success: true,
            turn: output,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getTurnDetails;

const WeightLog = require('../../../models/weightLog');

async function addLog(req, res, next) {
    try {
        await WeightLog.query().insert({
            referenceItemId: req.body.referenceItemId,
            weight: req.body.totalWeight,
            step: req.constants.step,
        });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = addLog;

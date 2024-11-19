const CreditReason = require('../../../models/creditReasons');

async function getReason(req, res, next) {
    try {
        const reasons = await CreditReason.query().select('id', 'reason');
        res.status(200).json({
            success: true,
            reasons,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getReason;

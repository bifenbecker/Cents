const { raw } = require('objection');
const CreditHistory = require('../../../models/creditHistory');

async function getCredits(req, res, next) {
    try {
        const { id } = req.params;
        const credits = await CreditHistory.query()
            .select(raw('coalesce(round(sum(amount)::numeric, 2), 0) as "creditAmount"'))
            .where({
                businessId: req.currentStore.businessId,
                customerId: id,
            });
        res.status(200).json({
            creditAmount: credits[0].creditAmount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getCredits;

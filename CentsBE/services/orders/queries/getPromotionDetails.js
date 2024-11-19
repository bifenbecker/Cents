const Promotion = require('../../../models/businessPromotionProgram');

async function getPromotionDetails(id, transaction) {
    const details = await Promotion.query(transaction)
        .withGraphJoined('promotionItems')
        .findById(id);
    return details;
}

module.exports = exports = getPromotionDetails;

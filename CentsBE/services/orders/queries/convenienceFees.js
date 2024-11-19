const ConvenienceFee = require('../../../models/convenienceFee');
const BusinessSettings = require('../../../models/businessSettings');

async function getConvenienceFeeById(transaction, convenienceFeeId) {
    return ConvenienceFee.query(transaction).findById(convenienceFeeId).where('isDeleted', false);
}

async function getConvenienceFeeByBusinessId(transaction, businessId) {
    const businessSettings = await BusinessSettings.query(transaction).findOne({
        businessId,
    });
    if (businessSettings?.hasConvenienceFee) {
        return ConvenienceFee.query(transaction).findOne({
            businessId,
            isDeleted: false,
        });
    }
    return null;
}

function formatConvenienceFee(convenienceFee, orderItemsTotal, promotionAmount) {
    const { feeType, fee } = convenienceFee;
    let convenienceAmount;

    if (feeType === 'PERCENTAGE') {
        convenienceAmount = Number(((orderItemsTotal - promotionAmount) * (fee / 100)).toFixed(2));
    } else {
        convenienceAmount = Number(fee).toFixed(2);
    }

    return convenienceAmount;
}

async function calculateConvenienceFee(
    transaction,
    convenienceFeeId,
    orderItemsTotal,
    promotionAmount,
) {
    const convenienceFee = await getConvenienceFeeById(transaction, convenienceFeeId);
    return formatConvenienceFee(convenienceFee, orderItemsTotal, promotionAmount);
}

module.exports = exports = {
    calculateConvenienceFee,
    getConvenienceFeeByBusinessId,
    getConvenienceFeeById,
    formatConvenienceFee,
};

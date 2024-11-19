const { getConvenienceFeeById } = require('../../services/orders/queries/convenienceFees');

const getConvenienceFee = async (payload) => {
    const { convenienceFeeId, removeConvenienceFee, transaction } = payload;

    if (convenienceFeeId) {
        payload.convenienceFee = await getConvenienceFeeById(transaction, convenienceFeeId);
    }

    if (removeConvenienceFee && payload?.convenienceFee) {
        payload.convenienceFee.fee = 0;
    }

    if (!convenienceFeeId) {
        payload.convenienceFee = null;
    }

    return payload;
};

module.exports = exports = getConvenienceFee;

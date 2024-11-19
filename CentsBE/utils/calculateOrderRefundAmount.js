module.exports = (order, canCancel) => {
    if (order.orderType === 'ONLINE') {
        return canCancel && order.creditAmount ? order.creditAmount : 0;
    }

    const refundAmount = order.netOrderTotal - order.balanceDue + order.creditAmount;
    return canCancel && refundAmount > 0 ? refundAmount : 0;
};

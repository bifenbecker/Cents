const detemineRefundableAmount = (payload) => {
    const { serviceOrder } = payload;
    const refundableAmount = Number(
        (serviceOrder.returnDeliveryFee + serviceOrder.returnDeliveryTip).toFixed(2),
    );
    payload.refundableAmount = refundableAmount;
    payload.deliveryFeeDifference = refundableAmount;
    return payload;
};

module.exports = exports = detemineRefundableAmount;

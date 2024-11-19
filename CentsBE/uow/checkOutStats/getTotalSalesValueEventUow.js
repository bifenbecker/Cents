async function getTotalSalesValue(payload) {
    const newPayload = payload;
    const { serviceOrders } = newPayload;
    const postPayOrderValues = serviceOrders
        .filter((order) => order.paymentTiming === 'POST-PAY')
        .map((prop) => prop.netOrderTotal);
    const postPaySalesValue = postPayOrderValues.reduce((value1, value2) => value1 + value2, 0);
    const orderValues = [
        Number(newPayload.cashCardTotal),
        Number(newPayload.creditCardTotal),
        Number(newPayload.cashTotal),
        Number(postPaySalesValue),
    ];
    const totalValue = orderValues.reduce((value1, value2) => value1 + value2, 0);
    newPayload.totalValue = totalValue.toFixed(2);
    newPayload.postPaySales = postPaySalesValue.toFixed(2);
    return newPayload;
}

module.exports = exports = getTotalSalesValue;

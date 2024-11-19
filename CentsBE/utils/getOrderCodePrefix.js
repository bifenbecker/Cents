function getOrderCodePrefix(order) {
    let orderTypePrefix;
    switch (order.orderType) {
        case 'RESIDENTIAL':
            orderTypePrefix = 'RWF-';
            break;
        case 'SERVICE':
            orderTypePrefix = 'WF-';
            break;
        case 'ONLINE':
            orderTypePrefix = 'DWF-';
            break;
        case 'INVENTORY':
            orderTypePrefix = 'INV-';
            break;
        default:
            orderTypePrefix = 'WF-';
    }
    return orderTypePrefix + order.orderCode;
}

module.exports = getOrderCodePrefix;

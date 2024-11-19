const { statuses } = require('../constants/constants');

/**
 * This utility method will check that given order
 * can be canceled or not based on OrderType and
 * current OrderStatus and from where the call is made
 *
 * @param {*} order
 * @param {boolean} [isFromLiveLink=false]
 * @return {boolean}
 */
function isOrderCanBeCanceled(order, isFromLiveLink = false) {
    if (!order) return false;

    switch (order.orderType) {
        case 'ONLINE':
            switch (order.status) {
                case statuses.SUBMITTED:
                    return true;
                case statuses.DESIGNATED_FOR_PROCESSING_AT_HUB:
                case statuses.READY_FOR_PROCESSING:
                case statuses.IN_TRANSIT_TO_HUB:
                case statuses.READY_FOR_INTAKE:
                case statuses.PROCESSING:
                case statuses.DRIVER_PICKED_UP_FROM_CUSTOMER:
                case statuses.RECEIVED_AT_HUB_FOR_PROCESSING:
                case statuses.DROPPED_OFF_AT_HUB:
                    return !isFromLiveLink;
                default:
                    return false;
            }
        case 'RESIDENTIAL':
        case 'SERVICE':
            switch (order.status) {
                case statuses.DESIGNATED_FOR_PROCESSING_AT_HUB:
                case statuses.READY_FOR_PROCESSING:
                case statuses.IN_TRANSIT_TO_HUB:
                case statuses.DROPPED_OFF_AT_HUB:
                case statuses.PROCESSING:
                case statuses.RECEIVED_AT_HUB_FOR_PROCESSING:
                    return !isFromLiveLink;
                default:
                    return false;
            }
        default:
            return false;
    }
}

module.exports = exports = isOrderCanBeCanceled;

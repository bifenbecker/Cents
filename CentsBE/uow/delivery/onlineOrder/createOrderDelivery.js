const OrderDelivery = require('../../../models/orderDelivery');
const mapOrderDelivery = require('../../liveLink/serviceOrders/getMappedOrderDelivery');
const computeDeliveryFee = require('../../../pipeline/delivery/estimate/computeDeliveryFee');
const {
    ORDER_DELIVERY_TYPES,
    ORDER_TYPES,
    deliveryProviders,
} = require('../../../constants/constants');

async function createOrderDelivery(payload) {
    const {
        store,
        order,
        orderType,
        storeCustomer,
        address,
        orderDelivery,
        transaction,
        thirdPartyDelivery,
        centsCustomerAddressId,
    } = payload;
    address.centsCustomerAddressId = centsCustomerAddressId;

    const isReturnOnlyDelivery =
        orderType !== ORDER_TYPES.ONLINE && orderDelivery.type === ORDER_DELIVERY_TYPES.RETURN;
    const deliveryFeeInfo =
        orderDelivery?.deliveryProvider === deliveryProviders.OWN_DRIVER && // only call API for own-driver deliveries for now
        (await computeDeliveryFee({
            storeId: store.id,
            currentCustomer: { id: storeCustomer.centsCustomerId },
            orderId: isReturnOnlyDelivery ? order.id : null,
        }));

    const orderDeliveryObj = mapOrderDelivery({
        store,
        order,
        orderType,
        storeCustomer,
        address,
        orderDelivery,
        thirdPartyDelivery,
        deliveryFeeInfo,
    });
    return OrderDelivery.query(transaction).insert(orderDeliveryObj);
}

module.exports = exports = createOrderDelivery;

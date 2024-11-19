const { getOrderDeliveryFeeDetails } = require('../../../utils/getOrderDeliveryFeeDetails');

function mapOrderDelivery({
    store,
    order,
    orderType,
    storeCustomer,
    address,
    orderDelivery,
    thirdPartyDelivery,
    deliveryFeeInfo,
}) {
    const tipToBeAdded = orderDelivery.courierTip || 0;

    return {
        storeId: store.id,
        storeCustomerId: storeCustomer.id,
        orderId: order.id,
        address1: address.address1,
        address2: address.address2 || null,
        city: address.city,
        firstLevelSubdivisionCode: address.firstLevelSubdivisionCode,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        instructions: {
            instructions: address.instructions,
            leaveAtDoor: address.leaveAtDoor,
        },
        customerName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
        customerPhoneNumber: storeCustomer.phoneNumber,
        customerEmail: storeCustomer.email || null,
        deliveryProvider: orderDelivery.deliveryProvider,
        deliveryWindow: orderDelivery.deliveryWindow,
        type: orderDelivery.type,
        status: orderDelivery.status,
        centsCustomerAddressId: address.centsCustomerAddressId,
        timingsId: orderDelivery.timingsId,
        courierTip: Number(tipToBeAdded),
        ...getOrderDeliveryFeeDetails({
            orderDelivery,
            settings: store,
            orderType,
            thirdPartyDelivery,
            deliveryFeeInfo,
        }),
    };
}

module.exports = exports = mapOrderDelivery;

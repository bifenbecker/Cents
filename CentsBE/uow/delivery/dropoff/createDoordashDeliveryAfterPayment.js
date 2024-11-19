const createReturnDoordashDelivery = require('../../liveLink/serviceOrders/delivery/createReturnDoordashDelivery');
const getCentsCustomerAndAddressUow = require('../../liveLink/serviceOrders/getCentsCustomerAndAddressUow');

async function createDoordashDeliveryAfterPayment(payload) {
    const {
        order: { delivery },
        currentStore,
        transaction,
        isPaymentFailed,
    } = payload;

    if (isPaymentFailed) return payload;

    const centsCustomerAndAddress = await getCentsCustomerAndAddressUow({
        ...delivery,
        transaction,
    });

    payload.returnPayload = delivery;
    payload.address = centsCustomerAndAddress.address;
    payload.customer = centsCustomerAndAddress.customer;
    payload.store = currentStore;
    payload.orderDelivery = delivery;
    payload.deliveryTip = delivery.courierTip;
    payload.delivery = delivery;

    await createReturnDoordashDelivery(payload);
    return payload;
}

module.exports = exports = createDoordashDeliveryAfterPayment;

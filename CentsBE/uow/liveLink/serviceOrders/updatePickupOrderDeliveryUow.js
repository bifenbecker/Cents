const OrderDelivery = require('../../../models/orderDelivery');

const setDataForManageOrder = require('../../../utils/setDataForManageOrder');

const getCentsCustomerAndAddressUow = require('./getCentsCustomerAndAddressUow');
const eventEmitter = require('../../../config/eventEmitter');

const updatePickupOrderDeliveryUow = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, pickupPayload, pickupDetails } = newPayload;

        const centsCustomerAndAddress = await getCentsCustomerAndAddressUow({
            ...pickupPayload,
            transaction,
        });

        await OrderDelivery.query(transaction).patch(pickupPayload).findById(pickupPayload.id);
        newPayload.pickup = pickupDetails;
        newPayload.address = centsCustomerAndAddress.address;
        newPayload.customer = centsCustomerAndAddress.customer;
        eventEmitter.emit('orderDeliveryUpdated', { orderDeliveryId: pickupPayload.id });
        return setDataForManageOrder(newPayload, 'PICKUP');
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updatePickupOrderDeliveryUow;

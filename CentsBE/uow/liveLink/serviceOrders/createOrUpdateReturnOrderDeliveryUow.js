const { isEmpty } = require('lodash');

const OrderDelivery = require('../../../models/orderDelivery');
const createOrderDelivery = require('../../delivery/onlineOrder/createOrderDelivery');

const setDataForManageOrder = require('../../../utils/setDataForManageOrder');
const setDataToCreateOrderDelivery = require('../../../utils/setDataToCreateOrderDelivery');

const getCentsCustomerAndAddressUow = require('./getCentsCustomerAndAddressUow');

const { returnMethods, orderDeliveryStatuses } = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

const canCreateReturnOrderDelivery = (payload) =>
    !payload.returnPayload.id &&
    payload.returnMethod === returnMethods.DELIVERY &&
    isEmpty(payload.deliveryDetails);

const createOrUpdateReturnOrderDeliveryUow = async (payload) => {
    try {
        const { returnPayload, transaction } = payload;
        const newPayload = payload;

        const centsCustomerAndAddress = await getCentsCustomerAndAddressUow({
            ...returnPayload,
            transaction,
        });

        newPayload.address = centsCustomerAndAddress.address;
        newPayload.customer = centsCustomerAndAddress.customer;
        if (canCreateReturnOrderDelivery(newPayload)) {
            const mappedData = setDataToCreateOrderDelivery(newPayload, 'RETURN');
            const createdReturnDelivery = await createOrderDelivery(mappedData);
            newPayload.deliveryDetails = createdReturnDelivery;
            newPayload.delivery = createdReturnDelivery;
            newPayload.isIntentDeliveryCreated =
                createdReturnDelivery.status === orderDeliveryStatuses.INTENT_CREATED;
        } else if (payload.returnMethod !== returnMethods.IN_STORE_PICKUP) {
            const updatedDelivery = await OrderDelivery.query(transaction)
                .patch(returnPayload)
                .findById(returnPayload.id)
                .returning('*');
            newPayload.delivery = updatedDelivery;
            newPayload.isIntentDeliveryUpdated =
                updatedDelivery.status === orderDeliveryStatuses.INTENT_CREATED;
            eventEmitter.emit('orderDeliveryUpdated', { orderDeliveryId: returnPayload.id });
        }

        return setDataForManageOrder(newPayload, 'RETURN');
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = createOrUpdateReturnOrderDeliveryUow;

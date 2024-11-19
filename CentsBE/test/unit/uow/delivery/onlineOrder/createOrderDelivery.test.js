require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const createOrderDelivery = require('../../../../../uow/delivery/onlineOrder/createOrderDelivery');
const factory = require('../../../../factories');
const {
    orderDeliveryStatuses,
    ORDER_DELIVERY_TYPES,
    ORDER_TYPES,
    deliveryProviders,
} = require('../../../../../constants/constants');
const OrderDelivery = require('../../../../../models/orderDelivery');

describe('test create order delivery', () => {
    let address, order, ownDeliverySetting, serviceOrder, store, storeCustomer;

    beforeEach(async () => {
        store = await factory.create('store');
        ownDeliverySetting = await factory.create('ownDeliverySetting', {
            storeId: store.id,
            deliveryFeeInCents: 500,
            returnDeliveryFeeInCents: 400,
        });
        const centsCustomer = await factory.create('centsCustomer');
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            status: 'HUB_PROCESSING_COMPLETE',
        });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        address = await factory.create('centsCustomerAddress', {
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should create a pickup order delivery entry for the store', async () => {
        // arrange
        const orderDelivery = {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            postalCode: '10003',
            type: ORDER_DELIVERY_TYPES.PICKUP,
            deliveryProvider: deliveryProviders.OWN_DRIVER,
        };

        const payload = {
            store,
            order,
            orderType: ORDER_TYPES.ONLINE,
            storeCustomer,
            address,
            orderDelivery,
            thirdPartyDelivery: {},
            centsCustomerAddressId: address.id,
        };

        // act
        await createOrderDelivery(payload);

        // assert
        const res = await OrderDelivery.query().findOne({ storeId: store.id });
        expect(res.storeId).to.equal(store.id);
        expect(res.totalDeliveryCost).to.equal(ownDeliverySetting.deliveryFeeInCents / 100 / 2);
    });

    it('should create a return only order delivery entry for the store', async () => {
        // arrange
        const orderDelivery = {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            postalCode: '10003',
            type: ORDER_DELIVERY_TYPES.RETURN,
            deliveryProvider: deliveryProviders.OWN_DRIVER,
        };

        const payload = {
            store,
            order,
            orderType: ORDER_TYPES.SERVICE,
            storeCustomer,
            address,
            orderDelivery,
            thirdPartyDelivery: {},
            centsCustomerAddressId: address.id,
        };

        // act
        await createOrderDelivery(payload);

        // assert
        const res = await OrderDelivery.query().findOne({ storeId: store.id });
        expect(res.storeId).to.equal(store.id);
        expect(res.totalDeliveryCost).to.equal(ownDeliverySetting.returnDeliveryFeeInCents / 100);
    });
});

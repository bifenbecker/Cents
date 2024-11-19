require('../../../../testHelper');
const { expect, assert, chai } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const createPickupOrderDelivery = require('../../../../../uow/delivery/onlineOrder/createPickupOrderDelivery');
const {
    orderDeliveryStatuses,
    ORDER_DELIVERY_TYPES,
    ORDER_TYPES,
    deliveryProviders,
} = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const StoreSettings = require('../../../../../models/storeSettings');
const eventEmitter = require('../../../../../config/eventEmitter');

describe('test createPickupOrderDelivery UoW', () => {
    beforeEach(() => {
        emitSpy = chai.spy.on(eventEmitter, 'emit');
    });

    afterEach(() => {
        chai.spy.restore(eventEmitter);
    });

    it('should add new properties from createOrderDelivery UoW', async () => {
        const initialProperty = 'initialProperty';
        const store = await factory.create(FN.store);
        const storeSettings = await StoreSettings.query().where({
            storeId: store.id,
        });
        await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            deliveryFeeInCents: 500,
            returnDeliveryFeeInCents: 400,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'HUB_PROCESSING_COMPLETE',
        });
        const order = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
        const address = await factory.create(FN.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
        });

        const pickup = {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            postalCode: '10003',
            type: ORDER_DELIVERY_TYPES.PICKUP,
            deliveryProvider: deliveryProviders.OWN_DRIVER,
        };

        const payload = {
            initialProperty,
            store,
            order,
            orderType: ORDER_TYPES.ONLINE,
            storeCustomer,
            address,
            centsCustomerAddressId: address.id,
            orderDelivery: {
                pickup,
            },
            serviceOrder,
            settings: storeSettings,
        };

        // call UoW
        const newPayload = await createPickupOrderDelivery(payload);

        // assert
        expect(newPayload).have.property('initialProperty', initialProperty);
        expect(newPayload).have.property('pickupOrderDelivery');
        expect(newPayload).have.property('orderDelivery').have.property('pickup');
        assert.deepEqual(newPayload.pickupOrderDelivery, newPayload.orderDelivery.pickup);
        expect(emitSpy).to.have.been.called();
    });
});

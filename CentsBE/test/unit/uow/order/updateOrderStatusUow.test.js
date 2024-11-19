require('../../../testHelper');
const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');
const { chai, expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateOrderStatusUow = require('../../../../uow/order/updateOrderStatusUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const StoreSettings = require('../../../../models/storeSettings');
const BusinessSettings = require('../../../../models/businessSettings');
const ServiceOrder = require('../../../../models/serviceOrders');
const eventEmitter = require('../../../../config/eventEmitter');
const {
    CREATE_STRIPE_INTENT_RESPONSE,
} = require('../../../constants/responseMocks');

describe('test updateOrderStatusUow ', () => {
    let laundromatBusiness, user, store, teamMember, teamMemberStore, storeCustomer, settings;

    beforeEach(async () => {
        laundromatBusiness = await factory.create(FN.laundromatBusiness);
        user = await factory.create(FN.user);
        store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        storeCustomer = await factory.create(FN.storeCustomer);
        teamMember = await factory.create(FN.teamMember, {
            employeeCode: '123',
            businessId: store.businessId,
            userId: user.id,
        });
        teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await StoreSettings.query()
            .where('storeId', store.id)
            .patch({
                timeZone: 'America/New_York',
            })
            .returning('*');
        settings = await store.getStoreSettings();
        store.storeSettings = await store.getStoreSettings();
    });

    it('should update order status when status is READY_FOR_PICKUP', async () => {
        const settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                isWeightAfterProcessing: false,
            })
            .returning('*');
        store.settings = settings[0];
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
            creditAmount: 100.00,
            status: 'READY_FOR_PICKUP',
            isProcessedAtHub: false,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'READY_FOR_PICKUP',
            orderBeforeUpdate,
            currentStore,
            rack: 'testRack',
            notifyUser: true,
        };
        const result = await updateOrderStatusUow(payload);
        expect(result).should.exist;
        expect(result.status).to.eq(payload.status);
        expect(result.order.delivery.status).to.eq(delivery.status);
        expect(spy).to.have.been.called.with('orders.readyForPickup', serviceOrder.id);
    });

    it('should update order status when status is HUB_PROCESSING_COMPLETE', async () => {
        store.settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .first();
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
            creditAmount: 100.00,
            status: 'HUB_PROCESSING_COMPLETE',
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'HUB_PROCESSING_COMPLETE',
            orderBeforeUpdate,
            currentStore,
            rack: 'testRack',
            notifyUser: true,
        };
        const result = await updateOrderStatusUow(payload);
        expect(result).should.exist;
        expect(result.status).to.eq(payload.status);
        expect(result.order.delivery.status).to.eq(delivery.status);
        expect(spy).to.have.been.called.with('orders.notifyLiveLink', serviceOrder.id);
    });

    it('should update inventory when status is cancelled', async () => {
        store.settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            })
            .returning('*');
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
            creditAmount: 100.00,
        });
        const order = await factory.create(FN.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const inventoryItem = await factory.create(FN.inventoryItem);
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            inventoryItemId: inventoryItem.id,
            orderItemId: serviceOrderItem.id,
            quantity: 10,
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
        });
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'CANCELLED',
            orderBeforeUpdate,
            currentStore,
            employeeCode: teamMember.employeeCode,
            notifyUser: true,

        };
        const result = await updateOrderStatusUow(payload);
        expect(result).should.exist;
        expect(result.status).to.eq(payload.status);
    });

    it('should throw an error if paymentStatus is not PAID', async () => {
        const settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            })
            .returning('*');
        store.settings = settings[0];
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 10,
            creditAmount: 100.00,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'succeeded',
            totalAmount: 10,
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('serviceOrderCompleted', spy);
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'COMPLETED',
            orderBeforeUpdate,
            currentStore,
            employeeCode: teamMember.employeeCode,
            notifyUser: true,

        };
        const result = await expect(updateOrderStatusUow(payload)).rejectedWith(Error);
        expect(result).to.have.property('message').equal('Order is not paid');
    });

    it('should add weights to the db successfully', async () => {
        store.settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .first();
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
            creditAmount: 100.00,
            status: 'READY_FOR_PICKUP',
            isProcessedAtHub: true,
        });
        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            totalWeight: 100.00,
            chargeableWeight: 100.00,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
        });
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'READY_FOR_PICKUP',
            orderBeforeUpdate,
            currentStore,
            rack: 'testRack',
            weight: serviceOrderWeight,
            step: 1,
        };
        const result = await updateOrderStatusUow(payload);
        expect(result.weight).should.exist;
        expect(result.weight.step).to.eq(payload.step);
        expect(result.weight.serviceOrderId).to.eq(serviceOrder.id);
        expect(result.weight.chargeableWeight).to.eq(serviceOrderWeight.chargeableWeight);
        expect(result.weight.totalWeight).to.eq(serviceOrderWeight.totalWeight);
    });

    it('should update service order status if status is completed', async () => {
        store.settings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
                isWeightUpOnCompletion: false,
            })
            .returning('*');
        const currentStore = store;
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 10,
            creditAmount: 100.00,
            isProcessedAtHub: true,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'requires_confirmation',
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'requires_confirmation',
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        sinon
            .stub(stripe.paymentIntents, 'confirm')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'requires_capture',
                amount: CREATE_STRIPE_INTENT_RESPONSE.amount,
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        sinon
            .stub(stripe.paymentIntents, 'capture')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id, {
                amount_to_capture: CREATE_STRIPE_INTENT_RESPONSE.amount,
            })
            .returns({
                status: 'succeeded',
                amount: CREATE_STRIPE_INTENT_RESPONSE.amount,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
            isProcessedAtHub: true,
        };
        const payload = {
            id: serviceOrder.id,
            hubId: serviceOrder.hubId,
            isProcessedAtHub: serviceOrder.isProcessedAtHub,
            status: 'COMPLETED',
            orderBeforeUpdate,
            currentStore,
            employeeCode: teamMember.employeeCode,
        };
        const result = await updateOrderStatusUow(payload);
        const updatedServiceOrder = await ServiceOrder.query()
            .findById(serviceOrder.id)
            .returning('*');
        expect(updatedServiceOrder.balanceDue).to.eq(0);
        expect(updatedServiceOrder.paymentStatus).to.eq('PAID');
        expect(result.status).to.eq(payload.status);
        expect(result.orderBeforeUpdate.serviceOrder.status).to.eq(serviceOrder.status);
        expect(result.orderBeforeUpdate.serviceOrder.balanceDue).to.eq(serviceOrder.balanceDue);
        expect(result.orderBeforeUpdate.serviceOrder.paymentStatus).to.eq(serviceOrder.paymentStatus);
    });

    it('should throw error when there is no payload', async () => {
        await expect(updateOrderStatusUow()).to.be.rejectedWith(Error);
    });
});

require('../../../testHelper');
const sinon = require('sinon');
const { transaction } = require('objection');
const stripe = require('../../../../stripe/stripeWithSecret');
const Model = require('../../../../models');
const ServiceOrder = require('../../../../models/serviceOrders');
const Payment = require('../../../../models/payment');
const {
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses,
    deliveryProviders,
    paymentStatuses,
} = require('../../../../constants/constants');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const ServiceOrderQuery = require('../../../../services/queries/serviceOrder');

const CHECK_NEXT_EXPECT = '';
const CANCELED_STATUS = 'canceled';

const orderWithDeliveries = async (storeId, serviceOrderId) => {
    const order = await factory.create(FACTORIES_NAMES.order, {
        storeId: storeId,
        orderableId: serviceOrderId,
        orderableType: 'ServiceOrder',
    });
    const orderDeliveryScheduled = await factory.create(FACTORIES_NAMES.orderDelivery, {
        storeId: storeId,
        orderId: order.id,
        deliveryWindow: ['1631043000000', '1631057400000'],
    });
    const orderDeliveryCompleted = await factory.create(FACTORIES_NAMES.orderDelivery, {
        storeId: storeId,
        orderId: order.id,
        deliveryWindow: ['1631053000000', '1631058400000'],
        status: orderDeliveryStatuses.COMPLETED,
    });
    const orderDeliveryCanceled = await factory.create(FACTORIES_NAMES.orderDelivery, {
        storeId: storeId,
        orderId: order.id,
        deliveryWindow: ['1631054000000', '1631059400000'],
        status: orderDeliveryStatuses.CANCELED,
        type: ORDER_DELIVERY_TYPES.RETURN,
    });
    const orderDeliveryPickupCanceled = await factory.create(FACTORIES_NAMES.orderDelivery, {
        storeId: storeId,
        orderId: order.id,
        deliveryWindow: ['1631054000000', '1631059400000'],
        status: orderDeliveryStatuses.CANCELED,
        type: ORDER_DELIVERY_TYPES.PICKUP,
    });
    return {
        orderDeliveryScheduled,
        orderDeliveryCompleted,
        orderDeliveryCanceled,
        orderDeliveryPickupCanceled,
    };
};

describe('test ServiceOrderQuery ', () => {
    let business, store, serviceOrder, serviceOrderQuery;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
        serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });
        serviceOrderQuery = new ServiceOrderQuery(serviceOrder.id);
    });

    it('serviceOrderQuery should have serviceOrderId and transaction if provided', async () => {
        const txn = await transaction.start(Model.knex());
        const serviceOrderQuery = new ServiceOrderQuery(serviceOrder.id, txn);

        expect(serviceOrderQuery.serviceOrderId).to.be.equal(serviceOrder.id);
        expect(serviceOrderQuery.transaction).to.be.equal(txn);
    });

    it('serviceOrderQuery should return serviceOrderDetails', async () => {
        const serviceOrderDetails = await serviceOrderQuery.serviceOrderDetails();

        expect({
            ...serviceOrderDetails,
            completedAt: serviceOrderDetails.completedAt.toDateString(),
        }).to.include({
            ...serviceOrder,
            completedAt: serviceOrder.completedAt.toDateString(),
        });
    });

    it('serviceOrderQuery should return deliveries from activeDeliveries only with scheduled statuses', async () => {
        const {
            orderDeliveryScheduled,
            orderDeliveryCompleted,
            orderDeliveryCanceled,
            orderDeliveryPickupCanceled,
        } = await orderWithDeliveries(store.id, serviceOrder.id);

        const deliveries = await serviceOrderQuery.activeDeliveries();

        expect(deliveries.length).to.be.equal(1);
        expect(deliveries).not.to.include(orderDeliveryCompleted);
        expect(deliveries).not.to.include(orderDeliveryCanceled);
        expect(deliveries).not.to.include(orderDeliveryPickupCanceled);
        expect({
            ...deliveries[0],
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDeliveryScheduled,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(deliveries[0].deliveryWindow).to.deep.equal(orderDeliveryScheduled.deliveryWindow);
    });

    it('serviceOrderQuery should return deliveries from completedDeliveries only with completed statuses', async () => {
        const {
            orderDeliveryScheduled,
            orderDeliveryCompleted,
            orderDeliveryCanceled,
            orderDeliveryPickupCanceled,
        } = await orderWithDeliveries(store.id, serviceOrder.id);

        const deliveries = await serviceOrderQuery.completedDeliveries();

        expect(deliveries.length).to.be.equal(1);
        expect(deliveries).not.to.include(orderDeliveryScheduled);
        expect(deliveries).not.to.include(orderDeliveryCanceled);
        expect(deliveries).not.to.include(orderDeliveryPickupCanceled);
        expect({
            ...deliveries[0],
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDeliveryCompleted,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(deliveries[0].deliveryWindow).to.deep.equal(orderDeliveryCompleted.deliveryWindow);
    });

    it('serviceOrderQuery should return delivery from cancelledDelivery only with cancelled statuses and return type', async () => {
        const {
            orderDeliveryScheduled,
            orderDeliveryCompleted,
            orderDeliveryCanceled,
            orderDeliveryPickupCanceled,
        } = await orderWithDeliveries(store.id, serviceOrder.id);

        const delivery = await serviceOrderQuery.cancelledDelivery();

        expect(delivery).not.to.include(orderDeliveryScheduled);
        expect(delivery).not.to.include(orderDeliveryCompleted);
        expect(delivery).not.to.include(orderDeliveryPickupCanceled);
        expect({
            ...delivery,
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDeliveryCanceled,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(delivery.deliveryWindow).to.deep.equal(orderDeliveryCanceled.deliveryWindow);
    });

    it('serviceOrderQuery should return delivery from cancelledPickup only with cancelled statuses and pickup type', async () => {
        const {
            orderDeliveryScheduled,
            orderDeliveryCompleted,
            orderDeliveryCanceled,
            orderDeliveryPickupCanceled,
        } = await orderWithDeliveries(store.id, serviceOrder.id);

        const delivery = await serviceOrderQuery.cancelledPickup();

        expect(delivery).not.to.include(orderDeliveryScheduled);
        expect(delivery).not.to.include(orderDeliveryCompleted);
        expect(delivery).not.to.include(orderDeliveryCanceled);
        expect({
            ...delivery,
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDeliveryPickupCanceled,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(delivery.deliveryWindow).to.deep.equal(orderDeliveryPickupCanceled.deliveryWindow);
    });

    it('serviceOrderQuery should return null from doordashPickup if pickup is absent', async () => {
        const doordashPickup = await serviceOrderQuery.doordashPickup();

        expect(doordashPickup).to.be.null;
    });

    it('serviceOrderQuery should return order pickup from doordashPickup', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDeliveryPickup = await factory.create(FACTORIES_NAMES.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            deliveryWindow: ['1631054000000', '1631059400000'],
            deliveryProvider: deliveryProviders.DOORDASH,
            type: ORDER_DELIVERY_TYPES.PICKUP,
        });

        const doordashPickup = await serviceOrderQuery.doordashPickup();

        expect({
            ...doordashPickup,
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDeliveryPickup,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(doordashPickup.deliveryWindow).to.deep.equal(orderDeliveryPickup.deliveryWindow);
    });

    it('serviceOrderQuery should return null from doordashDelivery if delivery is absent', async () => {
        const doordashDelivery = await serviceOrderQuery.doordashDelivery();

        expect(doordashDelivery).to.be.null;
    });

    it('serviceOrderQuery should return order delivery from doordashDelivery', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FACTORIES_NAMES.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            deliveryWindow: ['1631054000000', '1631059400000'],
            deliveryProvider: deliveryProviders.DOORDASH,
        });

        const doordashDelivery = await serviceOrderQuery.doordashDelivery();

        expect({
            ...doordashDelivery,
            deliveryWindow: CHECK_NEXT_EXPECT,
        }).to.include({
            ...orderDelivery,
            deliveryWindow: CHECK_NEXT_EXPECT,
        });
        expect(doordashDelivery.deliveryWindow).to.deep.equal(orderDelivery.deliveryWindow);
    });

    it('serviceOrderQuery should return null from pendingPayment if order payments is absent', async () => {
        const pendingPayment = await serviceOrderQuery.pendingPayment();

        expect(pendingPayment).to.be.null;
    });

    it('serviceOrderQuery should return null from pendingPayment if order payment status does not require confirmation', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            status: 'test',
            createdAt: new Date().toISOString(),
        });

        const pendingPayment = await serviceOrderQuery.pendingPayment();

        expect(pendingPayment).to.be.null;
    });

    it('serviceOrderQuery should return order payment from pendingPayment', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            status: 'requires_confirmation',
            createdAt: new Date().toISOString(),
        });

        const pendingPayment = await serviceOrderQuery.pendingPayment();

        expect({
            ...pendingPayment,
            totalAmount: ~~pendingPayment.totalAmount,
            transactionFee: ~~pendingPayment.transactionFee,
            tax: ~~pendingPayment.tax,
            completedAt: new Date(pendingPayment.createdAt).toLocaleDateString(),
            createdAt: new Date(pendingPayment.createdAt).toLocaleDateString(),
        }).to.include({
            ...payment,
            totalAmount: ~~payment.totalAmount,
            transactionFee: ~~payment.transactionFee,
            tax: ~~payment.tax,
            completedAt: new Date(payment.createdAt).toLocaleDateString(),
            createdAt: new Date(payment.createdAt).toLocaleDateString(),
        });
    });

    it('serviceOrderQuery should update payment status if balanceDue > 0 and pendingPayment is present', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            status: 'requires_confirmation',
            createdAt: new Date().toISOString(),
        });

        await serviceOrderQuery.updatePaymentStatus();

        const updatedServiceOrderDetails = await serviceOrderQuery.serviceOrderDetails();

        expect(updatedServiceOrderDetails.paymentStatus).to.equal(paymentStatuses.PENDING);
    });

    it('serviceOrderQuery should update payment status if balanceDue > 0 and pendingPayment is absent', async () => {
        await serviceOrderQuery.updatePaymentStatus();

        const updatedServiceOrderDetails = await serviceOrderQuery.serviceOrderDetails();

        expect(updatedServiceOrderDetails.paymentStatus).to.equal(paymentStatuses.BALANCE_DUE);
    });

    it('serviceOrderQuery should update payment status if balanceDue was not set', async () => {
        await ServiceOrder.query()
            .update({ balanceDue: 0 })
            .findById(serviceOrder.id)
            .returning('*');

        await serviceOrderQuery.updatePaymentStatus();

        const updatedServiceOrderDetails = await serviceOrderQuery.serviceOrderDetails();

        expect(updatedServiceOrderDetails.paymentStatus).to.equal(paymentStatuses.PAID);
    });

    it('serviceOrderQuery should not update payment status if balanceDue > 0 and order has INVOICING payment status', async () => {
        await ServiceOrder.query()
            .update({ paymentStatus: paymentStatuses.INVOICING })
            .findById(serviceOrder.id)
            .returning('*');

        await serviceOrderQuery.updatePaymentStatus();

        const updatedServiceOrderDetails = await serviceOrderQuery.serviceOrderDetails();

        expect(updatedServiceOrderDetails.paymentStatus).to.equal(paymentStatuses.INVOICING);
    });

    it('serviceOrderQuery should cancel pending payment in cancelPendingPayment', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            status: 'requires_confirmation',
            createdAt: new Date().toISOString(),
            paymentToken: 'cash',
        });

        sinon.stub(stripe, 'paymentIntents').value({
            cancel: () => ({
                status: CANCELED_STATUS,
            }),
        });

        await serviceOrderQuery.cancelPendingPayment();

        const updatedPayment = await Payment.query().findById(payment.id).returning('*');

        expect(updatedPayment.status).to.equal(CANCELED_STATUS);
    });

    it('serviceOrderQuery should return payments in fetchPayments', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            createdAt: new Date().toISOString(),
        });

        const payments = await serviceOrderQuery.fetchPayments();

        expect({
            ...payments[0],
            totalAmount: ~~payments[0].totalAmount,
            transactionFee: ~~payments[0].transactionFee,
            tax: ~~payments[0].tax,
            completedAt: new Date(payments[0].createdAt).toLocaleDateString(),
            createdAt: new Date(payments[0].createdAt).toLocaleDateString(),
        }).to.include({
            ...payment,
            totalAmount: ~~payment.totalAmount,
            transactionFee: ~~payment.transactionFee,
            tax: ~~payment.tax,
            completedAt: new Date(payment.createdAt).toLocaleDateString(),
            createdAt: new Date(payment.createdAt).toLocaleDateString(),
        });
    });

    it('serviceOrderQuery should return empty array if payment does not exist in fetchPayments', async () => {
        const payments = await serviceOrderQuery.fetchPayments();

        expect(payments.length).to.equal(0);
    });

    it('serviceOrderQuery should return true if successful payment exists', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FACTORIES_NAMES.payment, {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            createdAt: new Date().toISOString(),
            status: 'succeeded',
        });
        const successfulPayment = await serviceOrderQuery.hasSuccessfulPayment();

        expect({
            ...successfulPayment,
            totalAmount: ~~successfulPayment.totalAmount,
            transactionFee: ~~successfulPayment.transactionFee,
            tax: ~~successfulPayment.tax,
            completedAt: new Date(successfulPayment.createdAt).toLocaleDateString(),
            createdAt: new Date(successfulPayment.createdAt).toLocaleDateString(),
        }).to.include({
            ...payment,
            totalAmount: ~~payment.totalAmount,
            transactionFee: ~~payment.transactionFee,
            tax: ~~payment.tax,
            completedAt: new Date(payment.createdAt).toLocaleDateString(),
            createdAt: new Date(payment.createdAt).toLocaleDateString(),
        });
    });

    it('serviceOrderQuery should return false if successful payment does not exist', async () => {
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const successfulPayment = await serviceOrderQuery.hasSuccessfulPayment();

        expect(successfulPayment).to.be.false;
    });
});

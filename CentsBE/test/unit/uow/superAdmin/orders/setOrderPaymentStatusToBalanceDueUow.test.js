require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const ServiceOrder = require('../../../../../models/serviceOrders');
const Order = require('../../../../../models/orders');

const setOrderPaymentStatusToBalanceDue = require('../../../../../uow/superAdmin/orders/setOrderPaymentStatusToBalanceDueUow');

describe('test setOrderPaymentStatusToBalanceDue', () => {
    let store, serviceOrder, order, payment;

    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        payment = await factory.create('payments', {
            orderId: order.id,
            storeId: store.id,
            status: 'refunded',
            paymentProcessor: 'cash',
            paymentToken: 'cash',
            stripeClientSecret: 'cash',
        });
    });

    it('should change the ServiceOrder paymentStatus to BALANCE_DUE and reset balanceDue for the order', async () => {
        const payload = {
            updatedPayment: payment,
            order,
        };

        const serviceOrderBeforeUpdate = await ServiceOrder.query().findById(serviceOrder.id);

        // call Uow
        await setOrderPaymentStatusToBalanceDue(payload);

        // assert
        const newBalanceDue = Number(serviceOrderBeforeUpdate.balanceDue + payment.totalAmount);
        const foundOrder = await Order.query().withGraphFetched('serviceOrder').findById(order.id);
        expect(foundOrder.orderableId).to.equal(serviceOrder.id);
        expect(foundOrder.orderableType).to.equal('ServiceOrder');
        expect(foundOrder.serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(foundOrder.serviceOrder.balanceDue).to.equal(newBalanceDue);
    });
});

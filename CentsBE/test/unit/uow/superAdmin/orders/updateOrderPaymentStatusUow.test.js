require('../../../../testHelper');

const factory = require('../../../../factories');
const {expect} = require('../../../../support/chaiHelper');

const ServiceOrder = require('../../../../../models/serviceOrders');
const Order = require('../../../../../models/orders');

const updateOrderPaymentStatus = require('../../../../../uow/superAdmin/orders/updateOrderPaymentStatusUow');

describe('test updateOrderPaymentStatusUow', () => {
    let store, serviceOrderWithBalanceDue, orderWithBalanceDue, paymentForBalanceDue;

    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrderWithBalanceDue = await factory.create('serviceOrder', {
          storeId: store.id,
          netOrderTotal: 30,
          balanceDue: 30,
          paymentStatus: 'PENDING',
        });
        orderWithBalanceDue = await factory.create('order', {
          orderableType: 'ServiceOrder',
          orderableId: serviceOrderWithBalanceDue.id,
        });
        paymentForBalanceDue = await factory.create('payments', {
          orderId: orderWithBalanceDue.id,
          storeId: store.id,
          status: 'succeeded',
          totalAmount: 30,
        });
        serviceOrderForFailedPayment = await factory.create('serviceOrder', {
          storeId: store.id,
          netOrderTotal: 30,
          balanceDue: 30,
        });
        orderForFailedPayment = await factory.create('order', {
          orderableType: 'ServiceOrder',
          orderableId: serviceOrderForFailedPayment.id,
        });
        failedPayment = await factory.create('payments', {
          orderId: orderForFailedPayment.id,
          storeId: store.id,
          status: 'requires_payment_method',
          totalAmount: 30,
        });
    })

    it('should change the ServiceOrder paymentStatus to PAID and set balanceDue to 0', async () => {        
        const payload = {
          payment: paymentForBalanceDue,
          order: orderWithBalanceDue,
        };

        const serviceOrderBeforeUpdate = await ServiceOrder.query().findById(serviceOrderWithBalanceDue.id);

        // call Uow
        await updateOrderPaymentStatus(payload);

        // assert
        const newBalanceDue = Number(
          serviceOrderBeforeUpdate.balanceDue -
          paymentForBalanceDue.totalAmount
        );
        const foundOrder = await Order.query()
          .withGraphFetched('serviceOrder')
          .findById(orderWithBalanceDue.id);
        expect(foundOrder.orderableId).to.equal(serviceOrderWithBalanceDue.id);
        expect(foundOrder.orderableType).to.equal('ServiceOrder');
        expect(foundOrder.serviceOrder.paymentStatus).to.equal('PAID');
        expect(foundOrder.serviceOrder.balanceDue).to.equal(newBalanceDue);
    });

    it('should keep the ServiceOrder paymentStatus at BALANCE_DUE and set balanceDue to 30', async () => {        
        const payload = {
          payment: failedPayment,
          order: orderForFailedPayment,
        };

        // call Uow
        await updateOrderPaymentStatus(payload);

        // assert
        const foundOrder = await Order.query()
          .withGraphFetched('serviceOrder')
          .findById(orderWithBalanceDue.id);
        expect(foundOrder.orderableId).to.equal(serviceOrderWithBalanceDue.id);
        expect(foundOrder.orderableType).to.equal('ServiceOrder');
        expect(foundOrder.serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(foundOrder.serviceOrder.balanceDue).to.equal(serviceOrderForFailedPayment.balanceDue);
    });
});

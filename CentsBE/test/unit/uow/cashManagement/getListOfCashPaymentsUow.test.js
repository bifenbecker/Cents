require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const Payment = require('../../../../models/payment');
const ServiceOrder = require('../../../../models/serviceOrders');

const getListOfCashPayments = require('../../../../uow/cashManagement/getListOfCashPaymentsUow');

/**
 * Create a corresponding Order for a given ServiceOrder
 *
 * @param {Number} serviceOrderId
 */
async function createOrdersForServiceOrders(serviceOrderId) {
    const order = await factory.create('order', {
        orderableId: serviceOrderId,
        orderableType: 'ServiceOrder',
    });
    return { order, serviceOrderId };
}

/**
 * Create a payment for a given store and order
 *
 * @param {Number} orderId
 * @param {Number} storeId
 */
async function createPaymentForOrder(serviceOrderId, storeId, orderId, date) {
    const serviceOrder = await ServiceOrder.query().findById(serviceOrderId);

    const payload = {
      serviceOrderId,
      storeId,
      orderId,
      paymentProcessor: 'cash',
      totalAmount: serviceOrder.netOrderTotal,
      appliedAmount: serviceOrder.netOrderTotal,
    };

    if (date) {
      payload.createdAt = date;
    }

    const payment = await factory.create('payments', payload);
    return payment;
}

/**
 * Sum up the total cash payments
 *
 * @param {Array} imcomingArray
 */
function getSumTotalOfPayments(imcomingArray) {
    const totalAmounts = imcomingArray.map((item) => item.totalAmount);
    const totalPayments = totalAmounts.reduce((previous, currentItem) => previous + currentItem, 0);
    return totalPayments;
}

describe('test getListOfCashPaymentsUow', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
    });

    it('should retrieve a list of all cash payments for a store when no cash event is defined', async () => {
        const serviceOrders = await factory.createMany('serviceOrder', 5, {
          storeId: store.id,
          netOrderTotal: Math.floor(Math.random() * (100 - 1 + 1) + 1),
        });

        // create corresponding Order entries for ServiceOrder entries
        let orderAndServiceOrderId = serviceOrders.map((serviceOrder) =>
            createOrdersForServiceOrders(serviceOrder.id),
        );
        orderAndServiceOrderId = await Promise.all(orderAndServiceOrderId);
        // create corresponding Payment entries for Order entries
        let payments = orderAndServiceOrderId.map(({ order, serviceOrderId }) =>
            createPaymentForOrder(serviceOrderId, store.id, order.id),
        );
        payments = await Promise.all(payments);

        const payload = {
            store,
            cashEvent: undefined,
        };

        // call Uow
        const uowOutput = await getListOfCashPayments(payload);
        const { cashPayments } = uowOutput;

        // assert payments array match
        const foundPayments = await Payment.query().where({
            storeId: store.id,
            paymentProcessor: 'cash',
        });
        expect(cashPayments).to.exist;
        expect(cashPayments).to.deep.equal(foundPayments);

        // assert cash totals are accurate
        const expectedCashAmounts = getSumTotalOfPayments(cashPayments);
        const actualAmounts = getSumTotalOfPayments(foundPayments);
        expect(expectedCashAmounts).to.equal(actualAmounts);
    });

    it('should retrieve a list of cash payments made between current date and when the drawer was started', async () => {
        const teamMember = await factory.create('teamMember', { businessId: business.id });

        // create ServiceOrder, Order, and Payment before CashDrawerStartEvent
        const serviceOrderBefore = await factory.create('serviceOrder', {
          storeId: store.id,
          netOrderTotal: 100,
          placedAt: new Date('4-3-2022').toISOString(),
        });
        const orderBefore = await factory.create('order', {
          orderableId: serviceOrderBefore.id,
          orderableType: 'ServiceOrder',
        });
        await factory.create('payments', {
          storeId: store.id,
          orderId: orderBefore.id,
          paymentProcessor: 'cash',
          totalAmount: serviceOrderBefore.netOrderTotal,
          appliedAmount: serviceOrderBefore.netOrderTotal,
          createdAt: new Date('4-3-2022').toISOString(),
        });

        // createCashDrawerStartEvent
        const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: 5000,
            createdAt: new Date('4-4-2022').toISOString(),
        });

        // create series of ServiceOrders after CashDrawerStartEvent
        const serviceOrders = await factory.createMany('serviceOrder', 5, {
          storeId: store.id,
          netOrderTotal: Math.floor(Math.random() * (100 - 1 + 1) + 1),
          placedAt: new Date('4-5-2022').toISOString(),
        });

        // create corresponding Order entries for ServiceOrder entries
        let orderAndServiceOrderId = serviceOrders.map((serviceOrder) =>
            createOrdersForServiceOrders(serviceOrder.id),
        );
        orderAndServiceOrderId = await Promise.all(orderAndServiceOrderId);

        // create corresponding Payment entries for Order entries
        let payments = orderAndServiceOrderId.map(({ order, serviceOrderId }) =>
            createPaymentForOrder(
                serviceOrderId,
                store.id,
                order.id,
                new Date('4-5-2022').toISOString(),
            ),
        );
        payments = await Promise.all(payments);

        const payload = {
            store,
            cashEvent: cashDrawerStartEvent,
        };

        // call Uow
        const uowOutput = await getListOfCashPayments(payload);
        const { cashPayments } = uowOutput;

        // assert payments array match and the length excludes the payment prior to CashDrawerStartEvent
        const foundPayments = await Payment.query()
          .where({
              storeId: store.id,
              paymentProcessor: 'cash',
          })
          .andWhere('createdAt', '>=', cashDrawerStartEvent.createdAt);
        expect(cashPayments).to.exist;
        expect(cashPayments.length).to.equal(payments.length);
        expect(cashPayments).to.deep.equal(foundPayments);

        // assert cash totals are accurate
        const expectedCashAmounts = getSumTotalOfPayments(cashPayments);
        const actualAmounts = getSumTotalOfPayments(foundPayments);
        expect(expectedCashAmounts).to.equal(actualAmounts);
    });
});

require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const adjustBalanceDue = require('../../../../../../uow/order/serviceOrder/adjustOrder/adjustBalanceDue');
const ServiceOrder = require('../../../../../../models/serviceOrders');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const { paymentStatuses } = require('../../../../../../constants/constants');

describe('test adjustBalanceDue UoW', () => {
    let store, serviceOrder, payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderCode: '5004',
            balanceDue: -1,
            orderTotal: -1,
            netOrderTotal: -1,
            paymentTiming: 'POST-PAY',
            placedAt: '2020-05-07 16:20:.673073+00',
        });

        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
            currentOrderDetails: {
                paymentTiming: serviceOrder.paymentTiming,
                previousPaymentStatus: paymentStatuses.PAID,
            }
        };
    });

    it('should change balanceDue if paymentTiming is PRE-PAY', async () => {
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderCode: '5004',
            balanceDue: -1,
            orderTotal: -1,
            netOrderTotal: -1,
            paymentTiming: 'PRE-PAY',
            placedAt: '2020-05-07 16:20:.673073+00'
        });

        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
            currentOrderDetails: {
                paymentTiming: serviceOrder.paymentTiming,
                previousPaymentStatus: paymentStatuses.PENDING,
            }
        };
        
        await adjustBalanceDue(payload);

        const updatedBalanceDue = await ServiceOrder.query().findById(serviceOrder.id);

        expect(updatedBalanceDue.balanceDue).to.not.equal(serviceOrder.balanceDue);
    });

    it('should change balanceDue if previousPaymentStatus is PAID', async () => {
        await adjustBalanceDue(payload);

        const updatedBalanceDue = await ServiceOrder.query().findById(serviceOrder.id);

        expect(updatedBalanceDue.balanceDue).to.not.equal(serviceOrder.balanceDue);
    });

    it('should fail to update for not passing the payload', async () => {
        payload = {};
        expect(adjustBalanceDue(payload)).rejectedWith(Error);
    });

    it('should not update balanceDue if previousPaymentStatus is not PAID or paymentTiming is not PRE-PAY', async () => {
        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
            currentOrderDetails: {
                paymentTiming: serviceOrder.paymentTiming,
                previousPaymentStatus: paymentStatuses.BALANCE_DUE
            }
        };

        await adjustBalanceDue(payload);

        const updatedBalanceDue = await ServiceOrder.query().findById(serviceOrder.id);

        expect(updatedBalanceDue.balanceDue).to.equal(serviceOrder.balanceDue);
    });
});
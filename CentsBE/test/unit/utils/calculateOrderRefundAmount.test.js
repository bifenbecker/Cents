require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const calculateOrderRefundAmount = require('../../../utils/calculateOrderRefundAmount');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test calculateOrderRefundAmount', () => {
    
    it(`should return creditAmount when canCancel:true and orderType:ONLINE`, async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
            creditAmount: 10,
        });
        const amount = calculateOrderRefundAmount(serviceOrder, true);
        expect(amount).to.equal(serviceOrder.creditAmount);
    });

    it(`should return 0 when canCancel:false and orderType:ONLINE`, async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
            creditAmount: 10,
        });
        const amount = calculateOrderRefundAmount(serviceOrder, false);
        expect(amount).to.equal(0);
    });

    it(`should return 0 when orderType:ONLINE and creditAmount doesn't exist`, async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
        });
        const amount = calculateOrderRefundAmount(serviceOrder, true);
        expect(amount).to.equal(0);
    });

    it(`should return refundAmount`, async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 20,
            balanceDue: 10,
            creditAmount: 50,
        });
        const amount = calculateOrderRefundAmount(serviceOrder, true);
        expect(amount).to.equal(serviceOrder.netOrderTotal - serviceOrder.balanceDue + serviceOrder.creditAmount);
    });

    it(`should return 0 when canCancel:false`, async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 20,
            balanceDue: 10,
            creditAmount: 50,
        });
        const amount = calculateOrderRefundAmount(serviceOrder, false);
        expect(amount).to.equal(0);
    });

    it(`should return 0 when refundAmount less than 0`, async () => {
        const serviceOrder = {
            netOrderTotal: 10,
            balanceDue: 50,
            creditAmount: 10,
            orderType: 'SERVICE',
        }
        const amount = calculateOrderRefundAmount(serviceOrder, true);
        expect(amount).to.equal(0);
    });
});

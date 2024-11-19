require('../../../../../testHelper');
const { chai, expect } = require('../../../../../support/chaiHelper');
const OrderAdjustmentBuilder = require('../../../../../../services/orders/builders/adjustmentLogs/base');

const orderDetailsSample = {
    id: 'ID',
    notes: 'NOTES',
    previousNetOrderTotal: 'PREVIOUS_NET_ORDER_TOTAL',
    previousOrderTotal: 'PREVIOUS_ORDER_TOTAL',
    promotionId: 'PROMOTION_ID',
    previousPromotionId: 'PROMOTION_ID',
}

const employeeSample = {
    id: 'ID',
}

const calculatorSample = {
    netOrderTotal: 'NET_ORDER_TOTAL',
    creditAmount: 'CREDIT_AMOUNT',
    orderTotal: 'ORDER_TOTAL',
}

describe('test OrderAdjustmentBuilder', () => {
    describe('with employee', () => {
        let addOrderDetailsSpy, addEmployeeSpy, isPromotionChangedSpy, adjustmentLog;

        beforeEach(async () => {
            adjustmentLog = new OrderAdjustmentBuilder(orderDetailsSample, employeeSample, calculatorSample);
            addOrderDetailsSpy = chai.spy.on(adjustmentLog, "addOrderDetails");
            addEmployeeSpy = chai.spy.on(adjustmentLog, "addEmployee");
            isPromotionChangedSpy = chai.spy.on(adjustmentLog, "isPromotionChanged");
        });

        it('should build adjustmentLog', async () => {
            expect(adjustmentLog.orderDetails).to.include(orderDetailsSample);
            expect(adjustmentLog.calculator).to.include(calculatorSample);
            expect(adjustmentLog.employee).to.include(employeeSample);
        });

        it('test build', async () => {
            const buildedAdjustmentLog = adjustmentLog.build();

            expect(buildedAdjustmentLog).to.include({
                serviceOrderId: orderDetailsSample.id,
                notes: orderDetailsSample.notes,
                previousNetOrderTotal: orderDetailsSample.previousNetOrderTotal,
                newNetOrderTotal: calculatorSample.netOrderTotal,
                consumedCredits: calculatorSample.creditAmount,
                previousOrderTotal: orderDetailsSample.previousOrderTotal,
                newOrderTotal: calculatorSample.orderTotal,
                teamMemberId: employeeSample.id,
            });
            expect(addOrderDetailsSpy).to.have.been.called();
            expect(addEmployeeSpy).to.have.been.called();
            expect(isPromotionChangedSpy).to.have.been.called();
        });
    });

    describe('when employee is null and promotion changed', () => {
        let adjustmentLog;

        it('should build adjustmentLog', async () => {
            adjustmentLog = new OrderAdjustmentBuilder(orderDetailsSample, null, calculatorSample);

            expect(adjustmentLog.employee).to.be.empty;
            expect(adjustmentLog.orderDetails).to.include(orderDetailsSample);
            expect(adjustmentLog.calculator).to.include(calculatorSample);
        });

        it('test build', async () => {
            adjustmentLog = new OrderAdjustmentBuilder({
                ...orderDetailsSample,
                promotionId: 'NEW_PROMOTION_ID'
            }, null, calculatorSample);
            const addOrderDetailsSpy = chai.spy.on(adjustmentLog, "addOrderDetails");
            const addEmployeeSpy = chai.spy.on(adjustmentLog, "addEmployee");
            const isPromotionChangedSpy = chai.spy.on(adjustmentLog, "isPromotionChanged");
            const buildedAdjustmentLog = adjustmentLog.build();

            expect(buildedAdjustmentLog).to.include({
                serviceOrderId: orderDetailsSample.id,
                notes: orderDetailsSample.notes,
                previousNetOrderTotal: orderDetailsSample.previousNetOrderTotal,
                newNetOrderTotal: calculatorSample.netOrderTotal,
                consumedCredits: calculatorSample.creditAmount,
                previousOrderTotal: orderDetailsSample.previousOrderTotal,
                newOrderTotal: calculatorSample.orderTotal,
                promotionId: 'NEW_PROMOTION_ID',
            });
            expect(addOrderDetailsSpy).to.have.been.called();
            expect(addEmployeeSpy).to.have.been.called();
            expect(isPromotionChangedSpy).to.have.been.called();
        });
    });
});

require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const updatePayment = require('../../../../../routes/employeeTab/payment/updatePayment')
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { statuses } = require('../../../../../constants/constants');
const Payment = require('../../../../../models/payment');
const InventoryOrders = require('../../../../../models/inventoryOrders');
const ServiceOrders = require('../../../../../models/serviceOrders');

const paymentToUpdate = {
    status: 'succeeded',
    totalAmount: 10,
};

const getReqObj = (paymentToken) => {
    return {
        id: paymentToken,
        body: paymentToUpdate,
        status: 'requires_capture',
        amount: 100,
    }
};

describe('test /api/v1/employee-tab/payments/update', () => {
    let store, payment, serviceOrder;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: statuses.SUBMITTED,
        })
        const order = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            paymentToken: `${Number(new Date())}`,
        });
    });

    it('should call next(error)', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({});
        await updatePayment(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should update Payment and ServiceOrder ', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(
            getReqObj(payment.paymentToken),
        );
        await updatePayment(mockedReq, mockedRes, mockedNext);
        const updatedPayment = await Payment.query().findById(payment.id);
        const updatedServiceOrder = await ServiceOrders.query().findById(serviceOrder.id);

        expect(mockedRes.status.calledWith(200)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.haveOwnProperty('success').to.be.true;
        expect(updatedServiceOrder).to.include({
            paymentStatus: 'PAID',
            status: serviceOrder.status,
            balanceDue: -10,
        });
        expect(updatedPayment.status).to.equal(paymentToUpdate.status);
        expect(updatedPayment.totalAmount).to.equal(paymentToUpdate.totalAmount);
    });

    it('should update Payment and ServiceOrder when res is undefined ', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(
            getReqObj(payment.paymentToken),
        );
        await updatePayment(mockedReq, undefined, mockedNext);
        const updatedPayment = await Payment.query().findById(payment.id);        
        const updatedServiceOrder = await ServiceOrders.query().findById(serviceOrder.id);

        expect(mockedRes.status.called).to.be.false;
        expect(updatedServiceOrder).to.include({
            paymentStatus: 'PAID',
            status: serviceOrder.status,
            balanceDue: -10,
        });
        expect(updatedPayment.status).to.equal(paymentToUpdate.status);
        expect(updatedPayment.totalAmount).to.equal(paymentToUpdate.totalAmount);
    });

    it('should update Payment and ServiceOrder when req.body is undefined ', async () => {
        order = await factory.create(FN.serviceOrderMasterOrder);
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            ...getReqObj(payment.paymentToken),
            body: undefined,
        });        
        await updatePayment(mockedReq, mockedRes, mockedNext);
        const updatedPayment = await Payment.query().findById(payment.id);
        const updatedServiceOrder = await ServiceOrders.query().findById(serviceOrder.id);

        expect(mockedRes.status.called).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.haveOwnProperty('success').to.be.true;
        expect(updatedServiceOrder).to.include({
            paymentStatus: 'PAID',
            status: serviceOrder.status,
            balanceDue: -1,
        });
        expect(updatedPayment.status).to.equal('requires_capture');
        expect(updatedPayment.totalAmount).to.equal(1);
    });

    it('should update Payment and InventoryOrder ', async () => {
        const inventoryOrder = await factory.create(FN.inventoryOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            paymentToken: `${Number(new Date())}`,
        });

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(
            getReqObj(payment.paymentToken),
        );
        await updatePayment(mockedReq, mockedRes, mockedNext);
        const updatedPayment = await Payment.query().findById(payment.id);
        const updatedInventoryOrder = await InventoryOrders.query().findById(inventoryOrder.id);

        expect(mockedRes.status.calledWith(200)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.haveOwnProperty('success').to.be.true;
        expect(updatedInventoryOrder).to.include({
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            balanceDue: -10,
        });
        expect(updatedPayment.status).to.equal(paymentToUpdate.status);
        expect(updatedPayment.totalAmount).to.equal(paymentToUpdate.totalAmount);
    });
});

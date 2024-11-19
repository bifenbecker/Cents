require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertPostResponseError,
} = require('../../../support/httpRequestsHelper');

const ServiceOrder = require('../../../../models/serviceOrders');
const InventoryOrder = require('../../../../models/inventoryOrders');
const Payment = require('../../../../models/payment');


describe('test /api/v1/employee-tab/payments/create', () => {
    const ENDPOINT_URL = '/api/v1/employee-tab/payment/create';
    let store, token, storeCustomer;

    beforeEach(async () => {
        const business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
        });
    })

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => ENDPOINT_URL,
    );

    describe('with service order', () => {
        let serviceOrder, body;
        beforeEach(async () => {
            serviceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                balanceDue: 10,
                orderTotal: 10,
                netOrderTotal: 10,
            });
            const order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            body = {
                storeId: store.id,
                orderId: order.id,
                status: 'succeeded',
                totalAmount: 10.0,
                transactionFee: 0,
                paymentToken: 'cash',
                stripeClientSecret: 'cash',
                tax: 0,
                currency: 'usd',
                paymentProcessor: 'cash',
                appliedAmount: 10.0,
                unappliedAmount: 0,
                storeCustomerId: storeCustomer.id,
                destinationAccount: 'acct_xxxxxxxxxxx',
                changeDue: 10.0,
            };
        });

        it('should respond with a 200 code', async () => {
            const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                'authtoken',
                token,
            );
            
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            const payment = res.body.payment;
            const createdPayment = await Payment.query().findById(payment.id);
            expect(createdPayment).to.exist;
            expect(payment).to.deep.include(body);
            expect(payment.id).not.to.be.null;
        });

        describe('test update order', () => {
            it('should update order', async () => {
                const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                    'authtoken',
                    token,
                );

                res.should.have.status(200);
                const updatedServiceOrder = await ServiceOrder.query().findById(serviceOrder.id);
                expect(updatedServiceOrder.paymentStatus).to.eq('PAID');
                expect(updatedServiceOrder.status).to.eq('SUBMITTED');
                expect(updatedServiceOrder.balanceDue).to.eq(0);
                expect(res.body.payment.changeDue).to.eql(10.0);
            });

            describe('when paid amount less than balanceDue', () => {
                it('should update payment status to BALANCE_DUE ', async () => {
                    body.totalAmount = 5;
                    const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                        'authtoken',
                        token,
                    );

                    res.should.have.status(200);
                    const updatedServiceOrder = await ServiceOrder.query().findById(
                        serviceOrder.id,
                    );
                    expect(updatedServiceOrder.paymentStatus).to.eq('BALANCE_DUE');
                });
            });

            it('should throw an error with invalid payload', async () => {
                await assertPostResponseError({
                    url: ENDPOINT_URL,
                    body: {
                        ...body,
                        destinationAccount: null,
                    },
                    token,
                    code: 500,
                })
            });
        });
    });

    describe('with inventory order', () => {
        let inventoryOrder, body;

        beforeEach(async () => {
            inventoryOrder = await factory.create('inventoryOrder', {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                balanceDue: 10,
                orderTotal: 10,
                netOrderTotal: 10,
            });
            const order = await factory.create('order', {
                orderableId: inventoryOrder.id,
                orderableType: 'InventoryOrder',
            });
            body = {
                storeId: store.id,
                orderId: order.id,
                status: 'succeeded',
                totalAmount: 10.0,
                transactionFee: 0,
                paymentToken: 'cash',
                stripeClientSecret: 'cash',
                tax: 0,
                currency: 'usd',
                paymentProcessor: 'cash',
                appliedAmount: 10.0,
                unappliedAmount: 0,
                storeCustomerId: storeCustomer.id,
                destinationAccount: 'acct_xxxxxxxxxxx',
                changeDue: 10.0,
            };
        });

        it('should respond with a 200 code', async () => {
            const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                'authtoken',
                token,
            );

            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            const payment = res.body.payment;
            expect(payment).to.deep.include(body);
            expect(payment.id).not.to.be.null;
        });

        describe('test update order', () => {
            it('should update order', async () => {
                const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                    'authtoken',
                    token,
                );
                const updatedInventoryOrder = await InventoryOrder.query().findById(
                    inventoryOrder.id,
                );

                res.should.have.status(200);
                expect(updatedInventoryOrder.paymentStatus).to.eq('PAID');
                expect(updatedInventoryOrder.status).to.eq('COMPLETED');
                expect(updatedInventoryOrder.balanceDue).to.eq(0);
                expect(res.body.payment.changeDue).to.eql(10.0);
            });

            describe('with failed payment', () => {
                beforeEach(async () => {
                    body.status = 'failed';
                });

                it('should record in payment and update order', async () => {
                    const res = await ChaiHttpRequestHelper.post(ENDPOINT_URL, {}, body).set(
                        'authtoken',
                        token,
                    );
                    const updatedInventoryOrder = await InventoryOrder.query().findById(
                        inventoryOrder.id,
                    );

                    res.should.have.status(200);
                    const payment = res.body.payment;
                    expect(payment.status).to.eql('failed');
                    expect(updatedInventoryOrder.status).to.eq('PAYMENT_REQUIRED');
                    expect(updatedInventoryOrder.balanceDue).to.eq(10);
                });
            });
        });
    });
});

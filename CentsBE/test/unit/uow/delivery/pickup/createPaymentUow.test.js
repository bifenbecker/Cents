require('../../../../testHelper');
const sinon = require('sinon');
const { expect, assert } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createPayment = require('../../../../../uow/delivery/pickup/createPaymentUow');
const Payment = require('../../../../../models/payment');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');

describe('test createPaymentUoW', () => {
    it('should return correct payload and create Payment', async () => {
        const initialProperty = 'initialProperty';
        const paymentToken = 'paymentToken';
        const { laundromatBusiness, store, centsCustomer, order, storeCustomer, serviceOrder } =
            await createUserWithBusinessAndCustomerOrders();

        const stripePayload = {
            amount: 15000,
            currency: 'usd',
            customer: centsCustomer.stripeCustomerId,
            metadata: {
                storeId: store.id,
                customerEmail: centsCustomer.email,
                orderableType: 'ServiceOrder - pickup delivery order',
                storeCustomerId: storeCustomer.id,
                orderableId: serviceOrder.id,
            },
            payment_method: paymentToken,
            payment_method_types: ['card'],
            transfer_data: {
                destination: laundromatBusiness.merchantId,
            },
            on_behalf_of: laundromatBusiness.merchantId,
            application_fee_amount: Math.round(15000 * 0.04),
            capture_method: 'manual',
        };
        const stripeResponse = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, stripePayload);
        const payload = {
            order,
            store,
            serviceOrder,
            storeCustomer,
            customer: centsCustomer,
            business: laundromatBusiness,
            stripePaymentIntent: stripeResponse,
            initialProperty,
        };

        // call Uow
        const newPayload = await createPayment(payload);

        // assert
        expect(newPayload).to.have.property('initialProperty').equal(initialProperty);

        const createdPayment = await Payment.query().where({ storeId: store.id }).first();
        expect(createdPayment, 'should create Payment').not.be.undefined;

        const expectedPayment = {
            id: createdPayment.id,
            orderId: order.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: stripeResponse.status,
            totalAmount: Number(stripeResponse.amount / 100),
            transactionFee: Number(stripeResponse.application_fee_amount / 100),
            tax: 0,
            paymentToken: stripeResponse.id,
            stripeClientSecret: stripeResponse.client_secret,
            currency: 'usd',
            destinationAccount: laundromatBusiness.merchantId,
            paymentProcessor: 'stripe',
            appliedAmount: Number(stripeResponse.amount / 100),
            unappliedAmount: 0,
        };
        expect(newPayload).to.have.property('paymentModel');
        assert.deepOwnInclude(newPayload.paymentModel, expectedPayment);
    });

    it('should throw Error', async () => {
        const errorMessage = 'Unprovided error!';
        sinon.stub(Payment, 'query').callsFake(() => {
            throw new Error(errorMessage);
        });

        // assert
        await expect(createPayment({})).to.be.rejectedWith(errorMessage);
    });
});

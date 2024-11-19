require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    createPaymentMethod,
    TEST_ONLY: { storePaymentMethod },
} = require('../../../../../uow/delivery/dropoff/createPaymentMethodUow');
const factory = require('../../../../factories');
const PaymentMethod = require('../../../../../models/paymentMethod');
const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { transaction } = require('objection');
const Model = require('../../../../../models');

describe('test create payment method UOW', () => {
    describe('test createPaymentMethod', () => {
        let centsCustomer, stripePaymentMethodsStub, txn;

        beforeEach(async () => {
            centsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: 42,
            });

            stripePaymentMethodsStub = sinon.stub(stripe.paymentMethods);

            txn = await transaction.start(Model.knex());
        });

        it('should store payment method when flag is true', async () => {
            // arrange
            const payload = {
                transaction: txn,
                rememberPaymentMethod: true,
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'stripe',
                    type: 'credit',
                    token: 'pm_1I8UKlGhs3YLpJjFXBV7GFCo',
                },
            };

            // act
            await createPaymentMethod(payload);
            await txn.commit();

            // assert
            const paymentMethod = await PaymentMethod.query().where({
                paymentMethodToken: payload.payment.token,
                centsCustomerId: payload.centsCustomerId,
            });
            expect(paymentMethod).to.be.an('array');
            expect(paymentMethod).to.have.length(1);

            sinon.assert.called(stripePaymentMethodsStub.attach);
        });

        it('should not store payment method when flag is false', async () => {
            // arrange
            const payload = {
                transaction: txn,
                rememberPaymentMethod: false,
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'stripe',
                    type: 'credit',
                    token: 'pm_1I8UKlGhs3YLpJjFXBV7GFCo',
                },
            };

            // act
            await createPaymentMethod(payload);
            await txn.commit();

            // assert
            const paymentMethod = await PaymentMethod.query().where({
                paymentMethodToken: payload.payment.token,
                centsCustomerId: payload.centsCustomerId,
            });
            expect(paymentMethod).to.be.an('array');
            expect(paymentMethod).to.be.empty;

            sinon.assert.notCalled(stripePaymentMethodsStub.attach);
        });

        it('should throw Error in case of problems with Stripe API', async () => {
            // arrange
            const errorMessage = 'Unprovided error!';
            const payload = {
                transaction: txn,
                rememberPaymentMethod: true,
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'stripe',
                    type: 'credit',
                    token: 'pm_1I8UKlGhs3YLpJjFXBV7GFCo',
                },
            };
            sinon.restore();
            sinon.stub(stripe.paymentMethods, 'attach').throws(new Error(errorMessage));

            // assert
            await expect(createPaymentMethod(payload)).to.be.rejectedWith(errorMessage);
        });
    });

    describe('test storePaymentMethod', () => {
        let centsCustomer, stripePaymentMethodsStub, txn;

        beforeEach(async () => {
            centsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: 42,
            });

            stripePaymentMethodsStub = sinon.stub(stripe.paymentMethods);

            txn = await transaction.start(Model.knex());
        });

        it('should use existing payment method when exists', async () => {
            // arrange
            const existingPaymentMethod = await factory.create('paymentMethod', {
                centsCustomerId: centsCustomer.id,
            });

            const payload = {
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'stripe',
                    type: 'credit',
                    token: existingPaymentMethod.paymentMethodToken,
                },
            };

            // act
            await storePaymentMethod(payload, txn);
            await txn.commit();

            // assert
            const paymentMethod = await PaymentMethod.query().where({
                centsCustomerId: payload.centsCustomerId,
            });
            expect(paymentMethod).to.be.an('array');
            expect(paymentMethod).to.have.length(1);

            sinon.assert.called(stripePaymentMethodsStub.attach);
        });

        it('should create new payment method when dne', async () => {
            // arrange
            await factory.create('paymentMethod', {
                centsCustomerId: centsCustomer.id,
            });

            const payload = {
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'stripe',
                    type: 'credit',
                    token: 'new-token',
                },
            };

            // act
            await storePaymentMethod(payload, txn);
            await txn.commit();

            // assert
            const paymentMethod = await PaymentMethod.query().where({
                centsCustomerId: payload.centsCustomerId,
            });
            expect(paymentMethod).to.be.an('array');
            expect(paymentMethod).to.have.length(2);

            sinon.assert.called(stripePaymentMethodsStub.attach);
        });

        it('should not attach to stripe if non-stripe provider', async () => {
            // arrange
            const payload = {
                centsCustomerId: centsCustomer.id,
                customer: centsCustomer,
                payment: {
                    provider: 'non-stripe',
                    type: 'credit',
                    token: 'new-token',
                },
            };

            // act
            await storePaymentMethod(payload, txn);
            await txn.commit();

            // assert
            sinon.assert.notCalled(stripePaymentMethodsStub.attach);
        });
    });
});

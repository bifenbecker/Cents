require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    getCustomerPaymentMethods,
    TEST_ONLY: { getStripeCardDetails },
} = require('../../../../../uow/customer/paymentMethod/getCustomerPaymentMethodsUow');
const factory = require('../../../../factories');
const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { transaction } = require('objection');
const Model = require('../../../../../models');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test get customer payment methods UOW', () => {
    const testStripePaymentToken = 'pm_1I8UKlGhs3YLpJjFXBV7GFCo';
    const testLast4 = 1234;
    const testBrand = 'Visa';

    describe('test getStripeCardDetails', () => {
        let centsCustomer, stripePaymentMethodsRetrieveStub;

        beforeEach(async () => {
            centsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: 42,
            });

            stripePaymentMethodsRetrieveStub = sinon
                .stub(stripe.paymentMethods, 'retrieve')
                .withArgs(testStripePaymentToken)
                .returns({
                    card: {
                        last4: testLast4,
                        brand: testBrand,
                    },
                });
        });

        it('should retrieve card details when provider is stripe', async () => {
            // arrange
            const paymentMethod = {
                provider: 'stripe',
                paymentMethodToken: testStripePaymentToken,
                centsCustomerId: centsCustomer.id,
                id: 42,
                type: 'credit',
            };

            // act
            const res = await getStripeCardDetails(paymentMethod);

            // assert
            expect(res).to.be.an('object');
            expect(res).to.have.property('centsCustomerId', centsCustomer.id);
            expect(res).to.have.property('provider', paymentMethod.provider);
            expect(res).to.have.property('type', paymentMethod.type);
            expect(res).to.have.property('paymentMethodToken', paymentMethod.paymentMethodToken);
            expect(res).to.have.property('id', paymentMethod.id);

            expect(res).to.have.property('last4', testLast4);
            expect(res).to.have.property('brand', testBrand);

            sinon.assert.calledWith(stripePaymentMethodsRetrieveStub, testStripePaymentToken);
        });

        it('should not retrieve card details when provider is not stripe', async () => {
            // arrange
            const paymentMethod = {
                provider: 'star',
                paymentMethodToken: testStripePaymentToken,
                centsCustomerId: centsCustomer.id,
                id: 42,
                type: 'credit',
            };

            // act
            const res = await getStripeCardDetails(paymentMethod);

            // assert
            expect(res).to.be.an('object');
            expect(res).to.have.property('centsCustomerId', centsCustomer.id);
            expect(res).to.have.property('provider', paymentMethod.provider);
            expect(res).to.have.property('type', paymentMethod.type);
            expect(res).to.have.property('paymentMethodToken', paymentMethod.paymentMethodToken);
            expect(res).to.have.property('id', paymentMethod.id);

            expect(res).to.have.property('last4', null);
            expect(res).to.have.property('brand', null);

            sinon.assert.notCalled(stripePaymentMethodsRetrieveStub);
        });
    });

    describe('test getCustomerPaymentMethods', () => {
        it('should use existing payment method when exists', async () => {
            // arrange
            const centsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: 42,
            });
            const anotherCentsCustomer = await factory.create('centsCustomer', {
                stripeCustomerId: 72,
            });

            const stripePaymentMethod = await factory.create(FN.paymentMethod, {
                centsCustomerId: centsCustomer.id,
                provider: 'stripe',
                type: 'credit',
            });
            const otherPaymentMethod = await factory.create(FN.paymentMethod, {
                centsCustomerId: centsCustomer.id,
            });
            // anotherCentsCustomer
            await factory.create(FN.paymentMethod, {
                centsCustomerId: anotherCentsCustomer.id,
            });

            const stripePaymentMethodsRetrieveStub = sinon
                .stub(stripe.paymentMethods, 'retrieve')
                .returns({
                    card: {
                        last4: testLast4,
                        brand: testBrand,
                    },
                });

            const txn = await transaction.start(Model.knex());

            const payload = {
                centsCustomerId: centsCustomer.id,
                transaction: txn,
            };

            // act
            const res = await getCustomerPaymentMethods(payload);
            await txn.commit();

            // assert
            expect(res).to.have.property('paymentMethods');
            expect(res.paymentMethods).to.be.an('array');
            expect(res.paymentMethods).to.have.length(2);

            const paymentMethodIds = res.paymentMethods.map((method) => method.id);
            expect(paymentMethodIds).to.contain(stripePaymentMethod.id);
            expect(paymentMethodIds).to.contain(otherPaymentMethod.id);

            sinon.assert.calledOnce(stripePaymentMethodsRetrieveStub);
        });
    });
});

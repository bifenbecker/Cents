require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const sinon = require('sinon');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const savePaymentMethodForSubscription = require('../../../../../uow/delivery/onlineOrder/savePaymentMethodForSubscription');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test savePaymentMethodForSubscription UoW', () => {
    const paymentToken = 'paymentToken';
    const initialProperty = 'initialProperty';

    describe('should return initial payload', () => {
        const defaultAssert = (newPayload, initialPayload) => {
            expect(newPayload).not.have.property('paymentMethod');
            expect(newPayload).not.have.property('customer');
            expect(newPayload).not.have.property('centsCustomerId');
            expect(newPayload).not.have.property('rememberPaymentMethod');
            expect(newPayload).not.have.property('payment');
            assert.deepEqual(newPayload, initialPayload);
        };

        it('when subscription is empty', async () => {
            const payload = { subscription: {}, initialProperty };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayload = await savePaymentMethodForSubscription(payload);

            // assert
            defaultAssert(newPayload, initialPayload);
        });

        it('when paymentToken is not exist', async () => {
            const payload = { subscription: { id: 1 }, initialProperty };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayload = await savePaymentMethodForSubscription(payload);

            // assert
            defaultAssert(newPayload, initialPayload);
        });

        it('when paymentMethod is exist', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            await factory.create(FN.paymentMethod, {
                centsCustomerId: centsCustomer.id,
                paymentMethodToken: paymentToken,
            });

            const payload = {
                subscription: { id: 1 },
                paymentToken,
                centsCustomer,
                initialProperty,
            };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayload = await savePaymentMethodForSubscription(payload);

            // assert
            defaultAssert(newPayload, initialPayload);
        });
    });

    describe('should add new properties', () => {
        it('if paymentMethod is not exist', async () => {
            const stripePaymentMethod = { type: 'card' };
            const centsCustomer = await factory.create(FN.centsCustomerWithAddress);
            const stripeRetrieve = sinon
                .stub(StripePayment.prototype, 'retrievePaymentMethod')
                .returns({ type: 'card' });
            const stripeAttach = sinon.stub(stripe.paymentMethods, 'attach');

            const payload = {
                paymentToken,
                centsCustomer,
                subscription: { id: 1 },
                initialProperty,
            };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const { paymentMethod, ...newPayload } = await savePaymentMethodForSubscription(
                payload,
            );

            // assert
            expect(stripeRetrieve.called, 'should call stripe.retrievePaymentMethod').to.be.true;
            expect(
                stripeAttach.called,
                'should call stripe.paymentMethods.attach in createPaymentMethodUow',
            ).to.be.true;
            const expectedPayload = {
                ...initialPayload,
                customer: centsCustomer,
                centsCustomerId: centsCustomer.id,
                rememberPaymentMethod: true,
                payment: {
                    provider: 'stripe',
                    type: stripePaymentMethod.type,
                    token: paymentToken,
                },
            };
            assert.deepOwnInclude(newPayload, expectedPayload);
            assert.deepOwnInclude(
                paymentMethod,
                {
                    centsCustomerId: centsCustomer.id,
                    provider: 'stripe',
                    type: stripePaymentMethod.type,
                    paymentMethodToken: paymentToken,
                },
                'should include paymentMethod',
            );
        });
    });

    it('should throw Error in case of problems with Stripe API', async () => {
        // arrange
        const errorMessage = 'Unprovided error!';
        const payload = {
            paymentToken,
            centsCustomer: { id: 1 },
            subscription: { id: 1 },
        };

        sinon
            .stub(StripePayment.prototype, 'retrievePaymentMethod')
            .throws(new Error(errorMessage));

        // assert
        await expect(savePaymentMethodForSubscription(payload)).to.be.rejectedWith(errorMessage);
    });
});

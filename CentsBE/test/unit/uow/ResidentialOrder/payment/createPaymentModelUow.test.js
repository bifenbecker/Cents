require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createPaymentModelUow = require('../../../../../uow/ResidentialOrder/payment/createPaymentModelUow');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');

let entities;
const applicationFee = 0.6;
const stripeApplicationFee = applicationFee * 100;
describe('test createPaymentModel UoW', () => {
    beforeEach(async () => {
        const {
            laundromatBusiness,
            store,
            storeCustomer,
            serviceOrder,
            partnerSubsidiaryPaymentMethod: { partnerStripeCustomerId },
            order,
        } = await createUserWithBusinessAndCustomerOrders({ createPartnerSubsidiary: true });
        const amount = serviceOrder.netOrderTotal * 100;

        const stripePaymentIntent = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
            amount,
            customer: partnerStripeCustomerId,
            amount_received: amount,
            application_fee_amount: stripeApplicationFee,
            charges: {
                data: [
                    {
                        amount,
                        amount_captured: amount,
                        application_fee_amount: stripeApplicationFee,
                        payment_method_details: {
                            card: { amount_authorized: amount },
                        },
                    },
                ],
            },
        });

        entities = {
            serviceOrder,
            payload: {
                order,
                storeCustomer,
                store,
                stripePaymentIntent,
                business: laundromatBusiness,
            },
        };
    });

    it('should return valid newPayload', async () => {
        // call Uow
        const newPayload = await createPaymentModelUow(entities.payload);

        // assert
        expect(newPayload, 'with paymentModel property').to.have.property('paymentModel');
        expect(newPayload.paymentModel, 'with correct totalAmount')
            .to.have.property('totalAmount')
            .equals(entities.serviceOrder.netOrderTotal);
        expect(newPayload.paymentModel, 'with correct transactionFee')
            .to.have.property('transactionFee')
            .equals(applicationFee);
        expect(newPayload.paymentModel, 'with correct appliedAmount')
            .to.have.property('appliedAmount')
            .equals(entities.serviceOrder.netOrderTotal);
        expect(newPayload.paymentModel, 'with correct status')
            .to.have.property('status')
            .equals(entities.payload.stripePaymentIntent.status);
    });
});

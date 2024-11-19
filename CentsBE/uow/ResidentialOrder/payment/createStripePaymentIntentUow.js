require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');

const Business = require('../../../models/laundromatBusiness');
const ServiceOrder = require('../../../models/serviceOrders');
const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');
const PartnerSubsidiaryPaymentMethod = require('../../../models/partnerSubsidiaryPaymentMethod');

/**
 * Create and automatically capture a Stripe PaymentIntent for the order's balanceDue
 *
 * @param {Object} payload
 */
async function createStripePaymentIntent(payload) {
    try {
        const newPayload = payload;

        const business = await Business.query().findById(newPayload.store.businessId);
        const serviceOrder = await ServiceOrder.query()
            .withGraphJoined('order')
            .findById(newPayload.serviceOrderId);
        const storeCustomer = await StoreCustomer.query().findById(newPayload.storeCustomerId);
        const centsCustomer = await CentsCustomer.query().findById(newPayload.centsCustomerId);
        const partnerPaymentMethod = await PartnerSubsidiaryPaymentMethod.query().findOne({
            paymentMethodToken: newPayload.paymentMethodToken,
            isDeleted: false,
        });
        let customerToCharge = null;

        if (partnerPaymentMethod) {
            customerToCharge = partnerPaymentMethod.partnerStripeCustomerId;
        } else {
            customerToCharge = centsCustomer.stripeCustomerId;
        }

        const balanceDue = Number(serviceOrder.balanceDue).toFixed(2);
        const stripeBalanceDue = Number(balanceDue * 100).toFixed(2);
        const finalStripeTotal = Number(stripeBalanceDue);
        const stripeData = {
            amount: finalStripeTotal,
            currency: 'usd',
            confirm: true,
            customer: customerToCharge,
            metadata: {
                orderId: serviceOrder.order.id,
                storeId: newPayload.store.id,
                customerEmail: centsCustomer.email,
                orderableType: 'ServiceOrder',
                orderableId: serviceOrder.id,
                storeCustomerId: storeCustomer.id,
            },
            payment_method: newPayload.paymentMethodToken,
            transfer_data: {
                destination: business.merchantId,
            },
            on_behalf_of: business.merchantId,
            application_fee_amount: Math.round(serviceOrder.balanceDue * 0.04 * 100),
            off_session: false,
            capture_method: 'automatic',
        };

        const stripePaymentIntent = await stripe.paymentIntents.create(stripeData);

        newPayload.business = business;
        newPayload.stripePaymentIntent = stripePaymentIntent;
        newPayload.serviceOrder = serviceOrder;
        newPayload.order = serviceOrder.order;
        newPayload.storeCustomer = storeCustomer;
        newPayload.customer = centsCustomer;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripePaymentIntent;

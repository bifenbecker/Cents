require('../../../../testHelper');
const momenttz = require('moment-timezone');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { updateOrderStatusPipeline } = require('../../../../../pipeline/employeeApp/serviceOrder/updateOrderStatusPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');
const StoreSettings = require('../../../../../models/storeSettings');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const {
    CANCEL_STRIPE_INTENT_RESPONSE,
    STRIPE_CREDENTIALS,
} = require('../../../../constants/responseMocks');

function addDaysToCurrentDate(days = 1) {
    return momenttz().add(days, 'd').valueOf();
}

describe('test updateOrderStatusPipeline', () => {
    let store, teamMember, teamMemberStore, storeCustomer, serviceOrder, order,
        serviceOrderWeight, payment, settings, businessSettings, currentStore;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        storeCustomer = await factory.create(FN.storeCustomer);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        teamMember = await factory.create(FN.teamMember, {
            employeeCode: '123',
            businessId: store.businessId,
        });
        teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'requires_confirmation',
            paymentToken: STRIPE_CREDENTIALS.paymentIntentId,
        });
        sinon
            .stub(StripePayment.prototype, 'cancelPaymentIntent')
            .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);
        await StoreSettings.query()
            .where('storeId', store.id)
            .patch({
                timeZone: 'America/New_York',
            })
            .returning('*');
        businessSettings = await BusinessSettings.query()
            .where('businessId', store.businessId)
            .first();
        settings = await store.getStoreSettings();
        store.storeSettings = await store.getStoreSettings();
        store.settings = businessSettings;
        currentStore = store;
    });

    it('should return output if currentTime < deliveryTime', async () => {
        const delivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
        };
        const payload = {
            id: serviceOrder.id,
            masterOrderId: null,
            orderBeforeUpdate,
            status: 'READY_FOR_PICKUP',
            constants: { isOrder: serviceOrder, },
            isOrder: serviceOrder,
            currentStore,
        };
        const result = await updateOrderStatusPipeline(payload);
        expect(result.delivery.status).to.eq('CANCELED');
        expect(result.pendingPayment.status).to.eq(payment.status);
        expect(result.intentCreatedOrderDelivery.status).to.eq('CANCELED');
        expect(result.returnPayload.status).to.eq('CANCELED');
    });

    it('should return output if currentTime > deliveryTime', async () => {
        const delivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            status: 'INTENT_CREATED',
            deliveryWindow: [ addDaysToCurrentDate(-2), addDaysToCurrentDate(-2) ],
        });
        const orderBeforeUpdate = {
            serviceOrder,
            order: {
                id: order.id,
                delivery,
            },
            store: {
                settings,
            },
            storeId: store.id,
            storeCustomer,
        };
        const payload = {
            id: serviceOrder.id,
            masterOrderId: null,
            orderBeforeUpdate,
            status: 'READY_FOR_PICKUP',
            constants: { isOrder: serviceOrder, },
            isOrder: serviceOrder,
            currentStore,
            serviceOrderId: serviceOrder.id,
        };
        const result = await updateOrderStatusPipeline(payload);
        expect(result.intentCreatedOrderDelivery.status).to.eq('SCHEDULED');
        expect(result.returnMethod).to.eq('IN_STORE_PICKUP');
        expect(result.serviceOrder.returnMethod).to.eq('IN_STORE_PICKUP');
        expect(result.order.delivery.status).to.eq('SCHEDULED');
        expect(result.orderDelivery.status).to.eq('SCHEDULED');
        expect(result.store.storeSettings.onPremisePaymentProvider).to.eq('STRIPE');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(updateOrderStatusPipeline()).to.be.rejected;
        await expect(updateOrderStatusPipeline(null)).to.be.rejected;
        await expect(updateOrderStatusPipeline({})).to.be.rejected;
    });
});
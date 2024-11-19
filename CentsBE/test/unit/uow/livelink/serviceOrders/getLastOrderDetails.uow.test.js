require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const getLastOrderDetails = require('../../../../../uow/liveLink/serviceOrders/getLastOrderDetails');
const factory = require('../../../../factories');
const {
    fixedPriceServiceItemPayload,
    perPoundServiceItemPayload,
    perPoundModifierItemPayload,
    inventoryItemPayload,
} = require('../../../../support/adjustOrderTestHelper');
const ServiceOrder = require('../../../../../models/serviceOrders');
const ServicePrices = require('../../../../../models/servicePrices');

async function createServiceOrder(payload) {
    const { store, storeCustomer, promotion, centsCustomer, convenienceFeeId } = payload;
    const serviceOrderPayload = {
        storeCustomerId: storeCustomer.id,
        tipAmount: 10,
        creditAmount: 10,
        orderTotal: 10,
        promotionAmount: 10,
        taxAmountInCents: 1,
        netOrderTotal: 5.4,
        promotionId: promotion.id,
        convenienceFee: 5,
        convenienceFeeId,
        orderType: 'ONLINE',
        paymentTiming: 'PRE-PAY',
        storeId: store.id,
        status: 'COMPLETED',
        orderItems: [
            await fixedPriceServiceItemPayload(store, centsCustomer, true),
            await perPoundServiceItemPayload(store, centsCustomer, true),
            await perPoundModifierItemPayload(store, centsCustomer, true),
            await inventoryItemPayload(store, centsCustomer, true),
        ],
    };
    return ServiceOrder.query().insertGraphAndFetch(serviceOrderPayload);
}

describe('getLastOrderDetails', async () => {
    let serviceOrder, order, token, store, centsCustomer;

    beforeEach(async () => {
        store = await factory.create('store');
        centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
        });
        const convenienceFee = await factory.create('convenienceFee', {
            businessId: store.businessId,
        });
        serviceOrder = await createServiceOrder({
            store,
            storeCustomer,
            promotion,
            centsCustomer,
            convenienceFeeId: convenienceFee.id,
        });
        order = await factory.create('order', {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const pickupDetails = await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'COMPLETED',
            type: 'PICKUP',
            postalCode: '123456',
            storeId: serviceOrder.storeId,
        });
    });

    context('With out logged in user', async () => {
        it('should return empty object', async () => {
            let payload = {
                query: {
                    businessId: store.businessId,
                    zipCode: '',
                },
                currentCustomer: '',
            };
            const response = await getLastOrderDetails(payload);

            expect(response).to.be.empty;
        });
    });

    context('With logged In user', async () => {
        it('should return empty object if no service order found', async () => {
            let payload = {
                query: {
                    businessId: 0,
                    zipCode: 'xxx',
                },
                currentCustomer: centsCustomer,
            };
            const response = await getLastOrderDetails(payload);

            expect(response).to.be.empty;
        });

        it('should return empty object if service used in order is no more served by store', async () => {
            await ServicePrices.query().updateAndFetchById(
                serviceOrder.orderItems.find((item) =>
                    item.referenceItems.some((refItem) => refItem.servicePriceId !== null),
                ).referenceItems[0].servicePriceId,
                { isDeliverable: false },
            );

            const payload = {
                query: {
                    businessId: store.businessId,
                    zipCode: '123456',
                },
                currentCustomer: centsCustomer,
            };
            const response = await getLastOrderDetails(payload);

            expect(response).to.be.empty;
        });

        it('should return empty object if order is a RecurringSubscription', async () => {
            subscription = await factory.create('recurringSubscription');
            serviceOrderRecurringSubscription = await factory.create(
                'serviceOrderRecurringSubscription',
                {
                    recurringSubscriptionId: subscription.id,
                    serviceOrderId: serviceOrder.id,
                },
            );
            let payload = {
                query: {
                    businessId: store.businessId,
                    zipCode: '123456',
                },
                currentCustomer: centsCustomer,
            };
            const response = await getLastOrderDetails(payload);

            expect(response).to.be.empty;
        });

        it('should return clone and details', async () => {
            const { serviceId } = await ServicePrices.query().findById(
                serviceOrder.orderItems.find((item) =>
                    item.referenceItems.some((refItem) => refItem.servicePriceId !== null),
                ).referenceItems[0].servicePriceId,
            );
            await factory.create('serviceModifier', { serviceId });

            const payload = {
                query: {
                    businessId: store.businessId,
                    zipCode: '123456',
                },
                currentCustomer: centsCustomer,
            };
            const response = await getLastOrderDetails(payload);

            expect(response).not.to.be.empty;
            expect(response).to.have.a.property('clone').to.be.an('object');
            expect(response).to.have.a.property('details').to.be.an('object');
        });
    });
});

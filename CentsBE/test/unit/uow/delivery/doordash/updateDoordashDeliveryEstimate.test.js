require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const mockResponse = require('./updateDoordashDeliveryEstimate.mock.json');
const { setupDoordashDeliveryEstimateHttpMock } = require('../../../../support/mockedHttpRequests');
const updateDoordashDeliveryEstimate = require('../../../../../uow/delivery/doordash/updateDoordashDeliveryEstimate');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test updateDoordashDeliveryEstimate uow', () => {
    it('should return payload if delivery provider is not doordash', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payload = {
            orderDelivery: orderDelivery,
            currentStore: store,
            serviceOrder: serviceOrder,
        };
        const result = await updateDoordashDeliveryEstimate(payload);
        expect(result).should.exist;
        expect(result.orderDelivery.deliveryProvider).to.eq(orderDelivery.deliveryProvider);
        expect(result.currentStore.id).to.eq(store.id);
        expect(result.currentStore.name).to.eq(store.name);
        expect(result.currentStore.businessId).to.eq(store.businessId);
        expect(result.serviceOrder.id).to.eq(serviceOrder.id);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
        expect(result.serviceOrder.paymentStatus).to.eq(serviceOrder.paymentStatus);
    });

    it('should return payload if delivery provider is doordash', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100.00,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
            deliveryProvider: 'DOORDASH',
        });
        setupDoordashDeliveryEstimateHttpMock({ responseBody: { ...mockResponse } });
        const payload = {
            orderDelivery: orderDelivery,
            currentStore: store,
            serviceOrder: serviceOrder,
        };
        const result = await updateDoordashDeliveryEstimate(payload);
        expect(result).should.exist;
        expect(result.orderDelivery.deliveryProvider).to.eq(orderDelivery.deliveryProvider);
        expect(result.doordashEstimate.deliveryTime).to.eq(mockResponse.delivery_time);
        expect(result.doordashEstimate.pickupTime).to.eq(undefined);
        expect(result.doordashEstimate.estimateFee).to.eq(mockResponse.fee);
        expect(result.doordashEstimate.estimateId).to.eq(mockResponse.id);
        expect(result.doordashEstimate.currency).to.eq(mockResponse.currency);
    });

    it('should throw error when there is no payload', async () => {
        await expect(updateDoordashDeliveryEstimate()).to.be.rejectedWith(Error);
    });
});

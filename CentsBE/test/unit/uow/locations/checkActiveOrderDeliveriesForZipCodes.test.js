require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const checkActiveOrderDeliveriesForZipCode = require('../../../../uow/locations/checkActiveOrderDeliveriesForZipCode');
const factory = require('../../../factories');
const { orderDeliveryStatuses } = require('../../../../constants/constants');

describe('test checkActiveOrderDeliveriesForZipCodes uow', async () => {
    let serviceOrder, order, orderDelivery, response;

    it('should return zipcodes for active order deliveries', async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            postalCode: '10003',
        });
        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10003'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.deep.equal(['10003']);
    });

    it('should return empty array of zipcodes for completed order deliveries on the zip codes sent', async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            status: orderDeliveryStatuses.COMPLETED,
            postalCode: '10003',
        });
        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10003'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes for CANCELED order deliveries on the zip codes sent', async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            status: orderDeliveryStatuses.CANCELED,
            postalCode: '10003',
        });
        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10003'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes for failed order deliveries on the zip codes sent', async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            status: orderDeliveryStatuses.FAILED,
            postalCode: '10003',
        });
        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10003'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes for no order deliveries on the zip codes sent', async () => {
        const store = await factory.create('store');
        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10002'],
            storeId: store.id,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes if orderDeliveries are completed', async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder', { storeId: store.id });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.COMPLETED,
            orderId: order.id,
            postalCode: '10002',
            storeId: serviceOrder.storeId,
        });

        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10002'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes if orderDeliveries are canceled', async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder', { storeId: store.id });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.CANCELED,
            orderId: order.id,
            postalCode: '10002',
            storeId: serviceOrder.storeId,
        });

        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10002'],
            storeId: orderDelivery.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should return empty array of zipcodes if there are no order deliveries for the current store but there for a different store', async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder', { storeId: store.id });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
        orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            postalCode: '10002',
            storeId: serviceOrder.storeId,
        });

        diffStore = await factory.create('store');
        serviceOrderForDiffStore = await factory.create('serviceOrder', { storeId: diffStore.id });
        orderForDiffStore = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrderForDiffStore.id,
        });
        orderDeliveryForDiffStore = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.SCHEDULED,
            postalCode: '10003',
            orderId: orderForDiffStore.id,
            storeId: serviceOrderForDiffStore.storeId,
        });

        // Verifying if the stores and businesses are different
        expect(store.id).not.equal(diffStore.id);
        expect(store.businessId).not.equal(diffStore.businessId);

        response = await checkActiveOrderDeliveriesForZipCode({
            zipCodes: ['10002'],
            storeId: orderDeliveryForDiffStore.storeId,
        });
        expect(response).to.have.a.property('zipCodesForDelivery').to.be.an('array');
        expect(response.zipCodesForDelivery).to.be.empty;
    });

    it('should throw error for not passing the payload', async () => {
        expect(checkActiveOrderDeliveriesForZipCode()).rejectedWith(Error);
    });
});

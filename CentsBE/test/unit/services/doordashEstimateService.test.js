require('../../testHelper');
const nock = require('nock');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const mockResponse = require('../uow/doorDash/getDoorDashDeliveryDetails.mock.json');
const { setupDoordashDeliveryEstimateHttpMock } = require('../../support/mockedHttpRequests');
const DoordashEstimateService = require('../../../services/doordashEstimateService');

const netOrderTotal = 100.00;

describe('test doordashEstimateService', () => {
    let store, centsCustomerAndAddress, serviceOrder, order;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomerAndAddress = await factory.create(FN.centsCustomerAddress);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
    });

    afterEach(() => {
        nock.cleanAll();
    })

    it('should estimate doordash delivery successfully', async () => {
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            centsCustomerAddressId: centsCustomerAndAddress.id,
            type: 'RETURN',
        });
        const doordashEstimateService = new DoordashEstimateService(
            store.id,
            centsCustomerAndAddress,
            netOrderTotal,
            orderDelivery.deliveryWindow,
            orderDelivery.type,
        );
        setupDoordashDeliveryEstimateHttpMock({ responseBody: { ...mockResponse } });
        const result = await doordashEstimateService.estimate();
        expect(result).should.exist;
        expect(result.estimateFee).to.eq(mockResponse.fee);
        expect(result.estimateId).to.eq(mockResponse.id);
        expect(result.currency).to.eq(mockResponse.currency);
    });

    it('should estimate doordash delivery when orderDelivery.type is PICKUP', async () => {
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            centsCustomerAddressId: centsCustomerAndAddress.id,
            type: 'PICKUP',
        });
        const doordashEstimateService = new DoordashEstimateService(
            store.id,
            centsCustomerAndAddress,
            netOrderTotal,
            orderDelivery.deliveryWindow,
            orderDelivery.type,
        );
        setupDoordashDeliveryEstimateHttpMock({ responseBody: { ...mockResponse } });
        const result = await doordashEstimateService.estimate();
        expect(result).should.exist;
        expect(result.estimateFee).to.eq(mockResponse.fee);
        expect(result.estimateId).to.eq(mockResponse.id);
        expect(result.currency).to.eq(mockResponse.currency);
    });

    it('should throw error when there is no payload', async () => {
        const doordashEstimateService = new DoordashEstimateService();
        await expect(doordashEstimateService.estimate()).to.be.rejected;
    });
});

require('../../../../testHelper');
const createServiceOrderWeightLogs = require('../../../../../uow/order/serviceOrder/createServiceOrderWeightLogs');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const ServiceOrderWeightLog = require('../../../../../models/serviceOrderWeights');

describe('test createServiceOrderWeightLogs UOW', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        payload = {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        };
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.serviceOrder = serviceOrder;
    });

    it('should be able to add serviceOrder weight logs for the order', async () => {
        payload.chargeableWeight = 5;
        payload.totalWeight = 10;

        await createServiceOrderWeightLogs(payload);
        const serviceOrderWeightLogs = await ServiceOrderWeightLog.query()
            .where('serviceOrderId', payload.serviceOrder.id)
            .first();
        expect(serviceOrderWeightLogs)
            .to.have.property('serviceOrderId')
            .equal(payload.serviceOrder.id);
    });
});

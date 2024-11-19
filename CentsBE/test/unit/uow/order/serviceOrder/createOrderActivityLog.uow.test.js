require('../../../../testHelper');
const OrderActivityLog = require('../../../../../models/orderActivityLog');
const createOrderActivityLog = require('../../../../../uow/createOrderActivityLogUOW');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test createOrderActivityLog UOW', () => {
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

    it('should be able to create a orderActivityLog for service order', async () => {
        const result = await createOrderActivityLog(payload);
        const orderActivityLog = await OrderActivityLog.query().where(
            'orderId',
            payload.serviceOrder.id,
        );
        expect(orderActivityLog[0]).to.have.property('orderId').equal(payload.serviceOrder.id);
    });

    it('should throw an error if the service order id is not present for the order', async () => {
        expect(createOrderActivityLog({ serviceOrder: { id: 100 }, store })).rejected;
    });
});

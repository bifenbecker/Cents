require('../../../../testHelper');
const createOrder = require('../../../../../uow/order/createOrder');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test createOrder UOW', () => {
    let store, payload, centsCustomer, storeCustomer, business;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });

        centsCustomer = await factory.create('centsCustomer');
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        payload = {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        };
    });

    it('should be able to create a order for service order', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });
        const result = await createOrder({ serviceOrder, store, orderType: 'ServiceOrder' });
        expect(result.order).to.have.property('orderableId').equal(serviceOrder.id);
    });

    it('should be able to create a order for service order', async () => {
        const inventoryOrder = await factory.create('inventoryOrder', {
            ...payload,
            customerId: business.userId,
        });
        const result = await createOrder({ inventoryOrder, store, orderType: 'InventoryOrder' });
        expect(result.order).to.have.property('orderableId').equal(inventoryOrder.id);
    });

    it('should throw an error if the service order id is not present for the order', async () => {
        expect(createOrder({ serviceOrder: { id: 100 }, store })).rejected;
    });
    it('should throw an error if the inventory order id is not present for the order', async () => {
        expect(createOrder({ inventoryOrder: { id: 100 }, store })).rejected;
    });
});

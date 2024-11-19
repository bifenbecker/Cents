require('../../../testHelper');
const getActiveOrdersCount = require('../../../../uow/order/getActiveOrdersCount');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test active order count', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');
        payload = {
            storeId: store.id
        };
    });

    it('should return 2, if there are active orders', async () => {
        await factory.create('serviceOrder', { storeId: store.id })
        await factory.create('inventoryOrder', { storeId: store.id })

        const result = await getActiveOrdersCount(payload);
        expect(result).to.have.property('totalActiveOrdersCount').equal(2);
    })

    it('should return 0, if there are no active orders', async () => {
        await factory.create('serviceOrder', { storeId: store.id, status: 'COMPLETED' })
        await factory.create('inventoryOrder', { storeId: store.id, status: 'COMPLETED', netOrderTotal: 0 })
        
        const result = await getActiveOrdersCount(payload);
        expect(result).to.have.property('totalActiveOrdersCount').equal(0);
    })

    it('should return 1, if there is an active inventory order', async () => {
        await factory.create('serviceOrder', { storeId: store.id, status: 'COMPLETED' })
        await factory.create('inventoryOrder', { storeId: store.id })

        const result = await getActiveOrdersCount(payload);
        expect(result).to.have.property('totalActiveOrdersCount').equal(1);
    })

    it('should return 1, if there is an active service order', async () => {
        await factory.create('serviceOrder', { storeId: store.id, status: 'COMPLETED' })
        await factory.create('inventoryOrder', { storeId: store.id })

        const result = await getActiveOrdersCount(payload);
        expect(result).to.have.property('totalActiveOrdersCount').equal(1);
    })
});
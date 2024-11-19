const { expect } = require('../../../../support/chaiHelper');
const { createInventoryPayload } = require('../../../../support/serviceOrderTestHelper');
const factory = require('../../../../factories');
const updateStorageRacks = require('../../../../../uow/order/serviceOrder/adjustOrder/updateStorageRacks');
const StorageRacks = require('../../../../../models/storageRacks');

describe('test updateStorageRacks UOW', () => {
    let store, order, serviceOrder, storageRacks;
    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });

        payload = {
            storageRacks: [],
            id: serviceOrder.id,
            order,
        };
    });

    it('should add new storageRacks string', async () => {
        payload.storageRacks.push(
            {
                rackInfo: 'test again',
            },
            {
                rackInfo: 'test again',
            },
        );

        const result = await updateStorageRacks(payload);

        const allStorageRacks = await StorageRacks.query().where('serviceOrderId', payload.id);

        expect(allStorageRacks).to.be.an('array').to.have.length(1);
        expect(allStorageRacks[0])
            .to.be.an('object')
            .to.have.property('rackInfo')
            .equal('test again, test again');
    });

    it('should not add a new storageRacks if data is incorrect', async () => {
        payload.storageRacks = [];
        payload.storageRacks.push(
            {
                id: 1,
                rackInfos: 'test again',
            },
            {
                id: 1,
                rackInfo: 'test again',
            },
        );
        const result = await updateStorageRacks(payload);
        const allStorageRacks = await StorageRacks.query().where('serviceOrderId', serviceOrder.id);

        expect(allStorageRacks).to.be.an('array').to.have.length(0);
    });

    it('should update storageRacks string', async () => {
        storageRacks = await factory.create('storageRacks', { serviceOrderId: serviceOrder.id });
        payload.storageRacks.push(
            {
                rackInfo: 'rack 1',
            },
            {
                id: storageRacks.id,
                rackInfo: 'rack 2',
            },
        );
        const result = await updateStorageRacks(payload);
        const allStorageRacks = await StorageRacks.query().where('serviceOrderId', serviceOrder.id);

        expect(allStorageRacks).to.be.an('array').to.have.length(1);
        expect(allStorageRacks[0])
            .to.be.an('object')
            .to.have.property('rackInfo')
            .equal('rack 1, rack 2');
    });

    it('should be able to remove the storageRacks string', async () => {
        payload.storageRacks = [];
        const result = await updateStorageRacks(payload);
        const allStorageRacks = await StorageRacks.query().where('serviceOrderId', serviceOrder.id);

        expect(allStorageRacks).to.be.an('array').to.have.length(1);
        expect(allStorageRacks[0]).to.be.an('object').to.have.property('rackInfo').equal('');
    });
});

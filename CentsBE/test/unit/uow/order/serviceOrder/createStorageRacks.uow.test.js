require('../../../../testHelper');
const StorageRacks = require('../../../../../models/storageRacks');
const createStorageRacks = require('../../../../../uow/order/serviceOrder/createStorageRacks');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test createStorageRacks UOW', () => {
    const payload = {};

    beforeEach(async () => {
        const store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });

        payload.storeId = store.id;
        payload.status = 'READY_FOR_PROCESSING';
        payload.storeCustomerId = storeCustomer.id;
    });

    it('should be able to add serviceOrder storageRacks for the order', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.serviceOrder = serviceOrder;
        payload.storageRacks = [
            {
                rackInfo: '67u6',
            },
            {
                rackInfo: 'Ftggg',
            },
            {
                rackInfo: '',
            },
            {
                rackInfo: 'Ftgg',
            },
        ];
        await createStorageRacks(payload);
        const storageRacks = await StorageRacks.query().where(
            'serviceOrderId',
            payload.serviceOrder.id,
        );

        expect(storageRacks).to.be.an('array');
        expect(storageRacks.length).to.equal(1);
        expect(storageRacks[0])
            .to.have.property('serviceOrderId')
            .to.equal(payload.serviceOrder.id);
        expect(storageRacks[0]).to.have.property('rackInfo');
        expect(storageRacks[0].rackInfo).to.equal('67u6, Ftggg, Ftgg');
    });

    it('should throw an error if non existing serviceOrderId is sent', async () => {
        payload.storageRacks = [
            {
                rackInfoIsWrong: '67u6',
            },
            {
                rackInfo: 'Ftggg',
            },
            {
                rackInfo: '',
            },
            {
                rackInfo: 'Ftgg',
            },
        ];
        payload.serviceOrder = { id: 100 };
        expect(createStorageRacks(payload)).rejected;
    });
});

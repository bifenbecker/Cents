require('../../../../testHelper');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');
const createServiceOrderBags = require('../../../../../uow/order/serviceOrder/createServiceOrderBags');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { classicVersion, dryCleaningVersion } = require('../../../../support/apiTestHelper');

describe('test createServiceOrderBags UOW', () => {
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
    });

    it('should be able to add serviceOrder bags for the order', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.serviceOrder = serviceOrder;
        payload.version = classicVersion;
        payload.cents20LdFlag = false;
        payload.bags = [
            {
                barcode: '123',
                description: 'order bag',
                notes: 'order bags notes',
                manualNoteAdded: false,
            },
        ];
        await createServiceOrderBags(payload);
        const serviceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            payload.serviceOrder.id,
        );

        expect(serviceOrderBags).to.be.an('array');
        expect(serviceOrderBags[0])
            .to.have.property('serviceOrderId')
            .to.equal(payload.serviceOrder.id);
        expect(serviceOrderBags[0]).to.have.property('manualNoteAdded').equal(false);
    });

    it('should throw an error if non existing serviceOrderId is sent', async () => {
        payload.version = classicVersion;
        payload.cents20LdFlag = false;
        payload.bags = [
            {
                barcode: '123',
                description: 'order bag',
                notes: 'order bags notes',
            },
        ];
        payload.serviceOrder = { id: 100 };
        expect(createServiceOrderBags(payload)).rejected;
    });

    it('should be able to add advanced serviceOrder bags if Cents 2.0 is enabled', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.cents20LdFlag = true;
        payload.version = dryCleaningVersion;
        payload.serviceOrder = serviceOrder;
        payload.serviceOrderBags = [
            {
                barcode: '123',
                description: 'order bag',
                notes: [
                    {
                        id: 1,
                        name: 'Hot wash'
                    },
                    {
                        id: 2,
                        name: 'Hey'
                    }
                ],
                manualNote: 'My manual note',
            },
        ];
        await createServiceOrderBags(payload);
        const serviceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            payload.serviceOrder.id,
        );

        expect(serviceOrderBags).to.be.an('array');
        expect(serviceOrderBags[0])
            .to.have.property('serviceOrderId')
            .to.equal(payload.serviceOrder.id);
        expect(serviceOrderBags[0].notes).to.equal('Hot wash, Hey, My manual note');
        expect(serviceOrderBags[0]).to.have.property('manualNoteAdded').equal(true);
    });

    it('should be able to add advanced serviceOrder bags if version is 2.0.1', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.cents20LdFlag = true;
        payload.version = '2.0.1';
        payload.serviceOrder = serviceOrder;
        payload.serviceOrderBags = [
            {
                barcode: '123',
                description: 'order bag',
                notes: [
                    {
                        id: 1,
                        name: 'Big time cold wash'
                    },
                    {
                        id: 2,
                        name: 'Pierre food stains'
                    }
                ],
                manualNote: 'My manual note',
            },
        ];
        await createServiceOrderBags(payload);
        const serviceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            payload.serviceOrder.id,
        );

        expect(serviceOrderBags).to.be.an('array');
        expect(serviceOrderBags[0])
            .to.have.property('serviceOrderId')
            .to.equal(payload.serviceOrder.id);
        expect(serviceOrderBags[0].notes).to.equal('Big time cold wash, Pierre food stains, My manual note');
        expect(serviceOrderBags[0]).to.have.property('manualNoteAdded').equal(true);
    });
});

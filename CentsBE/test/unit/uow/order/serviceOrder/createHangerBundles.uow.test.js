require('../../../../testHelper');
const HangerBundles = require('../../../../../models/hangerBundles');
const createHangerBundles = require('../../../../../uow/order/serviceOrder/createHangerBundles');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test createHangerBundles UOW', () => {
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

    it('should be able to add serviceOrder hangerBundles for the order', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });

        payload.serviceOrder = serviceOrder;
        payload.hangerBundles = [
            {
                notes: [
                    {
                        id: 1,
                        name: 'Cold Wash',
                    },
                    {
                        id: 2,
                        name: 'Low Heat Dry',
                    },
                ],
                manualNote: 'test string for note',
            },
            {
                notes: [
                    {
                        id: 1,
                        name: 'Cold Wash',
                    },
                    {
                        id: 2,
                        name: 'Low Heat Dry',
                    },
                ],
            },
        ];
        await createHangerBundles(payload);
        const hangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            payload.serviceOrder.id,
        );
        expect(hangerBundles).to.be.an('array');
        expect(hangerBundles.length).to.equal(payload.hangerBundles.length);

        const foundById = hangerBundles.find(
            (element) => element.serviceOrderId === payload.serviceOrder.id,
        );
        const foundFalse = hangerBundles.find((element) => element.manualNoteAdded === false);

        expect(foundById).to.have.property('notes');
        expect(foundById)
            .to.be.an('object')
            .to.have.property('notes')
            .to.equal('Cold Wash, Low Heat Dry, test string for note');
        expect(foundById).to.be.an('object').to.have.property('manualNoteAdded').to.equal(true);
        expect(foundFalse)
            .to.be.an('object')
            .to.have.property('notes')
            .to.equal('Cold Wash, Low Heat Dry');
        expect(foundFalse).to.have.property('manualNoteAdded').to.equal(false);
    });

    it('should throw an error if non existing serviceOrderId is sent', async () => {
        payload.hangerBundles = [
            {
                notes: [
                    {
                        id: 1,
                        name: 'Cold Wash',
                    },
                    {
                        id: 2,
                        name: 'Low Heat Dry',
                    },
                ],
                manualNote: 'test string for note',
            },
        ];
        payload.serviceOrder = { id: 100 };
        expect(createHangerBundles(payload)).rejected;
    });
});

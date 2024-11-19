const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const updateHangerBundles = require('../../../../../uow/order/serviceOrder/adjustOrder/updateHangerBundles');
const HangerBundles = require('../../../../../models/hangerBundles');

describe('test updateHangerBundles UOW', () => {
    let store, order, serviceOrder, hangerBundles;
    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder');
        hangerBundles = await factory.createMany('hangerBundles', 2, {
            serviceOrderId: serviceOrder.id,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });

        payload = {
            hangerBundles: [],
            id: serviceOrder.id,
            order,
        };
    });

    it('should add a new hangerBundles if data is incorrect but leave note empty', async () => {
        payload.hangerBundles = [];
        payload.hangerBundles.push({
            note: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BUNDLE NOTE OK',
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find(
            (element) => element.notes === 'THIS IS A NEW BUNDLE NOTE OK',
        );
        expect(found)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('THIS IS A NEW BUNDLE NOTE OK');
    });

    it('should add a new hangerBundles', async () => {
        payload.hangerBundles = [];
        payload.hangerBundles.push({
            notes: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BUNDLE NOTE',
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find(
            (element) => element.notes === 'Cold water, High Dry, THIS IS A NEW BUNDLE NOTE',
        );
        expect(found)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, High Dry, THIS IS A NEW BUNDLE NOTE');
    });

    it('should add a new hangerBundles with only manual Notes', async () => {
        payload.hangerBundles.push({
            notes: [
                {
                    name: '',
                },
            ],
            manualNote: 'Hello',
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find((element) => element.notes === 'Hello');
        expect(found).to.be.an('object').to.have.property('notes').equal('Hello');
    });

    it('should add a new hangerBundles with only one note and one name value', async () => {
        payload.hangerBundles.push({
            notes: [
                {
                    name: 'note1',
                },
            ],
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find((element) => element.notes === 'note1');
        expect(found).to.be.an('object').to.have.property('notes').equal('note1');
    });

    it('should add a new hangerBundles with one note but no name', async () => {
        payload.hangerBundles.push({
            notes: [
                {
                    name: '',
                },
            ],
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find((element) => element.notes === '');
        expect(found).to.be.an('object').to.have.property('notes').equal('');
    });

    it('should add a new hangerBundles with two notes but only one name', async () => {
        payload.hangerBundles.push({
            notes: [
                {
                    name: 'Note 2',
                },
                {
                    name: '',
                },
            ],
        });
        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allHangerBundles).to.be.an('array').to.have.length(3);
        const found = allHangerBundles.find((element) => element.notes === 'Note 2');
        expect(found).to.be.an('object').to.have.property('notes').equal('Note 2');
    });

    it('should mark a hanger as deleted', async () => {
        const idToUpdate = hangerBundles[0].id;
        payload.hangerBundles.push({
            id: idToUpdate,
            notes: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BUNDLE NOTE',
            isDeleted: true,
        });

        await updateHangerBundles(payload);
        const queryResult = await HangerBundles.query().findById(idToUpdate);
        expect(queryResult).to.be.an('object').to.have.property('deletedAt').to.not.be.null;
    });

    it('should update a hanger note', async () => {
        const idToUpdate = hangerBundles[1].id;
        payload.hangerBundles.push({
            id: idToUpdate,
            notes: [
                {
                    name: 'Cold water',
                },
            ],
            manualNote: 'THIS BUNDLE NOTE WAS UPDATED',
        });

        await updateHangerBundles(payload);
        const queryResult = await HangerBundles.query().findById(idToUpdate);
        expect(queryResult)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, THIS BUNDLE NOTE WAS UPDATED');
    });

    it('should add, update, and delete hangers in the same request', async () => {
        const idToDelete = hangerBundles[0].id;
        const idToUpdate = hangerBundles[1].id;
        payload.hangerBundles.push(
            {
                id: idToDelete,
                notes: [
                    {
                        name: 'Note 1',
                    },
                    {
                        name: '',
                    },
                ],
                manualNote: 'string goes here',
                isDeleted: true,
            },
            {
                id: idToUpdate,
                notes: [
                    {
                        name: 'Cold water',
                    },
                ],
                manualNote: 'THIS BUNDLE NOTE WAS UPDATED AGAIN',
            },
            {
                notes: [
                    {
                        name: 'Note 1',
                    },
                    {
                        name: 'note 2',
                    },
                ],
            },
            {
                notes: [
                    {
                        name: 'Note 1',
                    },
                    {
                        name: '',
                    },
                ],
                manualNote: 'string goes here',
            },
            {
                notes: [
                    {
                        name: '',
                    },
                ],
                manualNote: 'string goes here',
            },
        );

        const result = await updateHangerBundles(payload);
        const allHangerBundles = await HangerBundles.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );

        expect(hangerBundles).to.be.an('array').to.have.length(2);
        expect(allHangerBundles).to.be.an('array').to.have.length(5);

        const foundDeleted = allHangerBundles.find((element) => element.id === idToDelete);
        const foundUpdated = allHangerBundles.find((element) => element.id === idToUpdate);

        expect(foundDeleted).to.be.an('object').to.have.property('deletedAt').to.not.be.null;
        expect(foundUpdated)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, THIS BUNDLE NOTE WAS UPDATED AGAIN');
    });
});

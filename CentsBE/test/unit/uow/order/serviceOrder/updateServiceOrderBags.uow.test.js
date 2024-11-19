const { expect } = require('../../../../support/chaiHelper');
const { createInventoryPayload } = require('../../../../support/serviceOrderTestHelper');
const factory = require('../../../../factories');
const updateServiceOrderBags = require('../../../../../uow/order/serviceOrder/adjustOrder/updateServiceOrderBags');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');

describe('test updateServiceOrderBags UOW', () => {
    let store, order, serviceOrder, serviceOrderBags;
    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder');
        await factory.create('serviceOrderBags', {
            serviceOrderId: serviceOrder.id,
            createdAt: new Date('4-5-2022').toISOString(),
        });
        await factory.create('serviceOrderBags', {
            serviceOrderId: serviceOrder.id,
            createdAt: new Date('4-6-2022').toISOString(),
        });
        serviceOrderBags = await ServiceOrderBags.query().where('serviceOrderId', serviceOrder.id);
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });

        payload = {
            serviceOrderBags: [],
            id: serviceOrder.id,
            order,
        };
    });

    it('should add a new serviceOrderBags if data is incorrect but leave note empty', async () => {
        payload.serviceOrderBags = [];
        payload.serviceOrderBags.push({
            note: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BAG NOTE OK',
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find(
            (element) => element.notes === 'THIS IS A NEW BAG NOTE OK',
        );
        expect(found)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('THIS IS A NEW BAG NOTE OK');
    });

    it('should add a new serviceOrderBags', async () => {
        payload.serviceOrderBags = [];
        payload.serviceOrderBags.push({
            notes: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BAG NOTE',
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find(
            (element) => element.notes === 'Cold water, High Dry, THIS IS A NEW BAG NOTE',
        );
        expect(found)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, High Dry, THIS IS A NEW BAG NOTE');
    });

    it('should add a new serviceOrderBags with only manual Notes', async () => {
        payload.serviceOrderBags.push({
            notes: [
                {
                    name: '',
                },
            ],
            manualNote: 'Hello',
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find((element) => element.notes === 'Hello');
        expect(found).to.be.an('object').to.have.property('notes').equal('Hello');
    });

    it('should add a new serviceOrderBags with only one note and one name value', async () => {
        payload.serviceOrderBags.push({
            notes: [
                {
                    name: 'note1',
                },
            ],
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find((element) => element.notes === 'note1');
        expect(found).to.be.an('object').to.have.property('notes').equal('note1');
    });

    it('should add a new serviceOrderBags with one note but no name', async () => {
        payload.serviceOrderBags.push({
            notes: [
                {
                    name: '',
                },
            ],
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find((element) => element.notes === '');
        expect(found).to.be.an('object').to.have.property('notes').equal('');
    });

    it('should add a new serviceOrderBags with two notes but only one name', async () => {
        payload.serviceOrderBags.push({
            notes: [
                {
                    name: 'Note 2',
                },
                {
                    name: '',
                },
            ],
        });
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
        const found = allServiceOrderBags.find((element) => element.notes === 'Note 2');
        expect(found).to.be.an('object').to.have.property('notes').equal('Note 2');
    });

    it('should mark a bag as deleted', async () => {
        const bagToUpdate = await ServiceOrderBags.query()
            .where('serviceOrderId', serviceOrder.id)
            .first();
        payload.serviceOrderBags.push({
            id: bagToUpdate.id,
            notes: [
                {
                    name: 'Cold water',
                },
                {
                    name: 'High Dry',
                },
            ],
            manualNote: 'THIS IS A NEW BAG NOTE',
            isDeleted: true,
        });

        await updateServiceOrderBags(payload);
        const queryResult = await ServiceOrderBags.query().findById(bagToUpdate.id);
        expect(queryResult).to.be.an('object').to.have.property('deletedAt').to.not.be.null;
    });

    it('should update a bag note', async () => {
        const idToUpdate = serviceOrderBags[1].id;
        payload.serviceOrderBags.push({
            id: idToUpdate,
            notes: [
                {
                    name: 'Cold water',
                },
            ],
            manualNote: 'THIS BAG NOTE WAS UPDATED',
        });

        await updateServiceOrderBags(payload);
        const queryResult = await ServiceOrderBags.query().findById(idToUpdate);
        expect(queryResult)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, THIS BAG NOTE WAS UPDATED');
    });

    it('should add, update, and delete bags in the same request', async () => {
        const idToDelete = serviceOrderBags[0].id;
        const idToUpdate = serviceOrderBags[1].id;
        payload.serviceOrderBags.push(
            {
                id: idToDelete,
                notes: [
                    {
                        name: 'To delete',
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
                manualNote: 'THIS BAG NOTE WAS UPDATED',
            },
            {
                notes: [
                    {
                        name: 'First bag added',
                    },
                    {
                        name: 'note 1',
                    },
                ],
            },
            {
                notes: [
                    {
                        name: 'Second bag added',
                    },
                    {
                        name: '',
                    },
                ],
                manualNote: 'with Manual String',
            },
            {
                notes: [
                    {
                        name: '',
                    },
                ],
                manualNote: 'added with only manual string',
            },
        );
        const result = await updateServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );

        expect(serviceOrderBags).to.be.an('array').to.have.length(2);
        expect(allServiceOrderBags).to.be.an('array').to.have.length(5);

        const foundDeleted = allServiceOrderBags.find((element) => element.id === idToDelete);
        const foundUpdated = allServiceOrderBags.find((element) => element.id === idToUpdate);

        expect(foundDeleted).to.be.an('object').to.have.property('deletedAt').to.not.be.null;
        expect(foundUpdated)
            .to.be.an('object')
            .to.have.property('notes')
            .equal('Cold water, THIS BAG NOTE WAS UPDATED');
    });
});

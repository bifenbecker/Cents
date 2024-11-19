const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const manageServiceOrderBags = require('../../../../../uow/driverApp/completePickupOrder/createServiceOrderBagsUOW.js');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');

describe('test createServiceOrderBags UOW', () => {
    let store, order, serviceOrder, serviceOrderBags;
    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder');
        await factory.create('serviceOrderBags', {
            serviceOrderId: serviceOrder.id,
        });
        await factory.create('serviceOrderBags', {
            serviceOrderId: serviceOrder.id,
        });
        serviceOrderBags = await ServiceOrderBags.query().where('serviceOrderId', serviceOrder.id);
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });

        payload = {
            updatedServiceOrder: serviceOrder,
        };
    });

    it('should add a new serviceOrderBags if bagCount is greater than existing bagCount', async () => {
        payload.bagsCount = 3;
        await manageServiceOrderBags(payload);
        const allServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(allServiceOrderBags).to.be.an('array').to.have.length(3);
    });

    it('should delete serviceOrderBags if bagCount is less than existing bagCount', async () => {
        payload.bagsCount = 1;
        await manageServiceOrderBags(payload);
        const filteredServiceOrderBags = await ServiceOrderBags.query().where(
            'serviceOrderId',
            serviceOrder.id,
        );
        expect(filteredServiceOrderBags).to.be.an('array').to.have.length(1);
    });
});

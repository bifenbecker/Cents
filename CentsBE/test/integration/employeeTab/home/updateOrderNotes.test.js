require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const ServiceOrder = require('../../../../models/serviceOrders');

const customerPreferences = 'PREFERENCES';
const notes = 'AAA';

describe('test updateOrderNotes', () => {
    let store, token, serviceOrder;
    const apiEndPoint = '/api/v1/employee-tab/home/order/notes/update';

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
    });

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {})
        .set('authtoken', '');
        res.should.have.status(401);
    })

    it('should update order notes', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            notes,
            orderId: serviceOrder.id,
            customerPreferences,
        })
        .set('authtoken', token);
        const updatedServiceOrder = await ServiceOrder.query()
            .withGraphFetched('storeCustomer')
            .findById(serviceOrder.id)
            .returning('*');

        res.should.have.status(200);
        expect(res.body).to.have.property('id').to.equal(serviceOrder.id);
        expect(res.body).to.have.property('notes').to.equal(notes);
        expect(updatedServiceOrder).to.have.property('notes').to.equal(notes);
        expect(res.body).to.have.property('customer').to.have.property('notes').to.equal(customerPreferences);
        expect(updatedServiceOrder).to.have.property('storeCustomer').to.have.property('notes').to.equal(customerPreferences);
    });

    it('should return an error when orderId is not sent', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            notes,
            customerPreferences,            
        })
        .set('authtoken', token);

        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal('undefined was passed to findById');
    });

    it('should return an error when notes is not sent', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            orderId: serviceOrder.id,
            customerPreferences,    
        })
        .set('authtoken', token);

        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal('undefined was passed to findById');
    });
});

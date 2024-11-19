require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const ServiceOrder = require('./../../../../models/serviceOrders');


describe('test updateRack', () => {
    let store, token, serviceOrder;
    const apiEndPoint = '/api/v1/employee-tab/home/order/rack';

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
    });

    it('should fail when token is not provided', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {})
        .set('authtoken', '',);
        
        res.should.have.status(401);
        expect(res.body).to.have.property('error').to.equal('Please sign in to proceed.');
    });

    it('should update rack info for ServiceOrder', async () => {
        const rack = 'A';
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            id: serviceOrder.id,
            rack,
        }).set(
            'authtoken',
            token,
        );
        const updatedOrder = await ServiceOrder.query()
            .findById(serviceOrder.id)
            .returning('*');

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(updatedOrder).to.have.property('rack').to.equal(rack);
    });
});
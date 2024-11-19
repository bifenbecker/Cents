require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test updateRack validation', () => {
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
    
    it('should return an error when rack is not a string', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            id: serviceOrder.id, 
            rack: 25,
        }).set(
            'authtoken',
            token,
        );
        
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('"rack" must be a string');
    });

    it('should return an error when id less than 1', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            id: 0, 
            rack: 'A',
        }).set(
            'authtoken',
            token,
        );
        
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('"id" must be larger than or equal to 1');
    });

    it('should return an error when id is not passed', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            rack: 'A',
        }).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('"id" is required');
    });

    it('should return an error when rack is not passed', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            id: serviceOrder.id,
        }).set(
            'authtoken',
            token,
        );

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('"rack" is required');
    });

    it('should return success when rack is null', async () => {
        const res = await ChaiHttpRequestHepler.patch(apiEndPoint, {}, {
            id: serviceOrder.id,
            rack: null,
        }).set(
            'authtoken',
            token,
        );
        expect(res.body).to.have.property('success').to.equal(true);
    });
});

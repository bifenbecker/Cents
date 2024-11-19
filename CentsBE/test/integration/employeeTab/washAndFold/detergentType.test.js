require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

describe('test detergentType', () => {
    let store, token;
    const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/detergent-type';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndPoint,
    );

    it('should return detergentType', async () => {
        const detergentType = await factory.create('detergentType');
        const res =  await ChaiHttpRequestHepler.get(apiEndPoint)
        .set('authtoken', token);
        res.should.have.status(200);

        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('detergentTypes');
        expect(res.body.detergentTypes[0].id).to.equal(detergentType.id);
        expect(res.body.detergentTypes[0].detergentTypes).to.equal(detergentType.detergentTypes);
    });

})

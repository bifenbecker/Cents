require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');


describe('test getFeaturedModifiers', () => {
    let store, token, payload, serviceOrder, serviceModifier;
    const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/featured';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        serviceMaster  = await factory.create('serviceMaster');
        serviceModifier = await factory.create('serviceModifier', {
            serviceId: serviceMaster.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndPoint,
    );

    it('should return featuredModifiers', async () => {
        payload = { 
            orderId: serviceOrder.id,
        };
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/${serviceMaster.id}/modifiers`
        )
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('featuredModifiers').to.not.be.empty;
        expect(res.body.featuredModifiers[0]).to.have.property('serviceModifierId').to.equal(serviceModifier.id);
    });
})

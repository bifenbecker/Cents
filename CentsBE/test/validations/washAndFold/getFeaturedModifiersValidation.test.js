require('../../testHelper');
const ChaiHttpRequestHepler = require('../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../support/apiTestHelper')
const factory = require('../../factories')
const { expect } = require('../../support/chaiHelper');

describe('test getFeaturedModifiers', () => {
    let store, token, centsCustomer, serviceOrder, serviceCategory, serviceMaster, serviceModifier;
    const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/featured';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        serviceCategory = await factory.create('serviceCategory', {
            businessId: store.businessId,
        });
        serviceMaster  = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
        });
        serviceModifier = await factory.create('serviceModifier', {
            serviceId: serviceMaster.id,
        });
    });

    it('should return featuredModifiers', async () => {
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/${serviceMaster.id}/modifiers`
        )
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('featuredModifiers').to.not.be.empty;
        expect(res.body.featuredModifiers[0]).to.have.property('serviceModifierId').to.equal(serviceModifier.id);
    });

    it('should fails when serviceId is not a number', async () => {
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/string/modifiers`
        )
        .set('authtoken', token);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "serviceId" fails because ["serviceId" must be a number]');
    });

    it('should fails when serviceId less than 1', async () => {
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/0/modifiers`
        )
        .set('authtoken', token);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "serviceId" fails because ["serviceId" must be larger than or equal to 1]');
    });
})

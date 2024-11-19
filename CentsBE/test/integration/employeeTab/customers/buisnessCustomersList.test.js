require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { businessCustomerSchema } = require('../../../../elasticsearch/businessCustomer/schema');
const {
    fetchAndReindexBusinessCustomers,
} = require('../../../../elasticsearch/businessCustomer/queries');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');

describe('buisness customers list test', () => {
    const apiEndPoint = '/api/v1/employee-tab/customers/search';
    let token, centsCustomer;
    before(async () => {
        await businessCustomerSchema();
    });
    beforeEach(async () => {
        const business = await factory.create('laundromatBusiness');
        const store = await factory.create('store', {
            businessId: business.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        const businessCustomer = await factory.create('businessCustomer', {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
        });
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
            businessCustomerId: businessCustomer.id,
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
            phoneNumber: centsCustomer.phoneNumber,
        });
        token = await generateToken({ id: store.id });
        await fetchAndReindexBusinessCustomers();
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', '');
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.patch(apiEndPoint).set(
            'authtoken',
            'invalid_token',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Invalid token.');
    });

    it('should list the customers', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndPoint, {}).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('details');
        expect(res.body).to.have.property('totalCount').to.equal(1);
        expect(res.body.details[0])
            .to.have.property('fullName')
            .to.equal(`${centsCustomer.firstName} ${centsCustomer.lastName}`);
    });

    it('should search and list the customers based on the keyword', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndPoint, {
            keyword: centsCustomer.firstName,
        }).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('details');
        expect(res.body).to.have.property('totalCount').to.equal(1);
        expect(res.body.details[0])
            .to.have.property('fullName')
            .to.equal(`${centsCustomer.firstName} ${centsCustomer.lastName}`);
    });

    it('should return 0 results when non existing customer is searched', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndPoint, {
            field: 'name',
            keyword: 'fewqfwefqfewffweq',
        }).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('details');
        expect(res.body).to.have.property('totalCount').to.equal(0);
    });
});

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint(centsCustomerId) {
    return `/api/v1/employee-tab/customers/${centsCustomerId}/details`;
}

describe('test getCustomerDetails', () => {
    let laundromatBusiness, centsCustomer, store, storeCustomer, token;

    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store', {businessId: laundromatBusiness.id});
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        token = generateToken({ id: store.id });
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(centsCustomer.id)).set(
            'authtoken',
            '',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(centsCustomer.id)).set(
            'authtoken',
            'invalid_token',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Invalid token.');
    });

    it('should throw an error if invalid customer id was passed', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint('invalid_id')).set(
            'authtoken',
            token,
        );
        response.should.have.status(500);
    });

    it('should throw an error if customer was not found', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(-1)).set(
            'authtoken',
            token,
        );
        response.should.have.status(500);
    });

    it('should get customer details successfully', async () => {
        const response = await ChaiHttpRequestHelper
            .get(getApiEndPoint(centsCustomer.id))
            .set(
                'authtoken',
                token,
            );

        response.should.have.status(200);
        expect(response.body.success).to.be.true;
        expect(response.body.details).to.have.property('isCommercial', false);
        expect(response.body.details).to.have.property('isInvoicingEnabled', false);
    });
});

require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper')
const {generateToken} = require('../../../../support/apiTestHelper')
const factory = require('../../../../factories')
const { expect } = require('../../../../support/chaiHelper');

describe('test createPreferenceOptionSelection', () => {
    let store, payload, token, centsCustomer;
    const apiEndPoint = '/api/v1/employee-tab/customers';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
    });

    it('should create CustomerPreferenceOptionSelection', async () => {
        const businessCustomerPreferences = await factory.create('businessCustomerPreferences', {
            businessId: store.businessId,
        });
        const preferenceOptions = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: businessCustomerPreferences.id
        });

        let payload = { preferenceOptionId: preferenceOptions.id }
        const res =  await ChaiHttpRequestHepler.post(
            `${apiEndPoint}/${centsCustomer.id}/preferences-choices/selections`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(201);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.selection.centsCustomerId).to.equal(centsCustomer.id);
        expect(res.body.selection.preferenceOptionId).to.equal(preferenceOptions.id);
    });

    it('should return an error if preferenceOptionId not passed', async () => {
        const res =  await ChaiHttpRequestHepler.post(
            `${apiEndPoint}/${centsCustomer.id}/preferences-choices/selections`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });

    it('should return an error if bad request', async () => {
        const res =  await ChaiHttpRequestHepler.post(
            `${apiEndPoint}/${undefined}/preferences-choices/selections`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
    });
})

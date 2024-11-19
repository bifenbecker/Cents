require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper')
const {generateToken} = require('../../../../support/apiTestHelper')
const factory = require('../../../../factories')
const { expect } = require('../../../../support/chaiHelper');

describe('test getCustomerPreferencesChoices', () => {
    let store, payload, token, centsCustomer, businessCustomerPreferences, preferenceOptions, customerPreferencesOptionSelection;
    const apiEndPoint = '/api/v1/employee-tab/customers';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        businessCustomerPreferences = await factory.create('businessCustomerPreferences', {
            businessId: store.businessId,
        });
        preferenceOptions = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: businessCustomerPreferences.id
        });
        customerPreferencesOptionSelection = await factory.create('customerPreferencesOptionSelection', {
            centsCustomerId: centsCustomer.id,
            preferenceOptionId: preferenceOptions.id,
        });
    });

    it('should return customer preferences choices', async () => {
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/${centsCustomer.id}/business/${store.businessId}/preferences-choices`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.preferences[0].options).to.not.be.undefined;
        expect(res.body.preferences[0].options).to.not.be.null;
    });

    it('check if customer preferences choices not selected', async () => {
        const customerWithoutPreferences = await factory.create('centsCustomer');
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/${customerWithoutPreferences.id}/business/${store.businessId}/preferences-choices`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body.preferences[0].options[0].selected).to.be.false;
        expect(res.body).to.have.property('success').to.equal(true);;
    });

    it('should return an error if bad request', async () => {
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/${undefined}/business/${undefined}/preferences-choices`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
    });
})

require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/preference-choices/business/:businessId';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async ({ businessId, centsCustomerId }) => {
    const customerauthtoken = generateLiveLinkCustomerToken({
        id: centsCustomerId,
    });

    const currentApiEndpoint = apiEndpoint.replace(':businessId', businessId);

    const response = await ChaiHttpRequestHelper.get(currentApiEndpoint, {}, {}).set({
        customerauthtoken,
    });

    return response;
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    let centsCustomer;
    it('should return correct response', async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        const business = await factory.create(FN.laundromatBusiness);
        const businessCustomerPreference = await factory.create(FN.businessCustomerPreferences, {
            businessId: business.id,
        });
        const preferenceOption = await factory.create(FN.preferenceOptions, {
            businessCustomerPreferenceId: businessCustomerPreference.id,
        });
        const customerPreferencesOptionSelection = await factory.create(
            FN.customerPreferencesOptionSelection,
            {
                preferenceOptionId: preferenceOption.id,
                centsCustomerId: centsCustomer.id,
            },
        );

        const response = await makeRequest({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('preferences').to.be.lengthOf(1);
        expect(response.body.preferences[0]).to.have.property('options').to.be.lengthOf(1);

        const preference = response.body.preferences[0];
        expect(preference)
            .to.have.property('fieldName')
            .to.be.equal(businessCustomerPreference.fieldName);
        expect(preference).to.have.property('type').to.be.equal(businessCustomerPreference.type);

        const option = response.body.preferences[0].options[0];
        expect(option).to.have.property('value').to.be.equal(preferenceOption.value);
        expect(option).to.have.property('selected').to.be.true;
        expect(option)
            .to.have.property('selectionId')
            .to.be.equal(customerPreferencesOptionSelection.id);
        expect(option)
            .to.have.property('businessCustomerPreferenceId')
            .to.be.equal(businessCustomerPreference.id);
    });

    it('should return response without preferences if there are not created', async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        const business = await factory.create(FN.laundromatBusiness);

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('preferences').to.be.eql([]);
    });

    it('should return response with status 400 when businessId is undefined', async () => {
        centsCustomer = await factory.create(FN.centsCustomer);

        sinon.stub(global, 'parseInt').returns(undefined);

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            businessId: undefined,
        });

        response.should.have.status(400);
        expect(response.body)
            .to.have.property('error')
            .to.be.equal('invalid businessId or customerId params');
    });

    it('should catch error when faced with unexpected error when businessId is a null', async () => {
        centsCustomer = await factory.create(FN.centsCustomer);

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            businessId: null,
        });

        response.should.have.status(500);
        expect(response.body).to.have.property('error').to.not.be.empty;
    });
});

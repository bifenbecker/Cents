require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper')
const {generateToken} = require('../../../../support/apiTestHelper')
const factory = require('../../../../factories')
const { expect } = require('../../../../support/chaiHelper');

describe('test updatePreferenceOptionSelection', () => {
    let store, payload, token, centsCustomer, customerPreferencesOptionSelection;
    const apiEndPoint = '/api/v1/employee-tab/customers';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        customerPreferencesOptionSelection = await factory.create('customerPreferencesOptionSelection', {
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should update CustomerPreferenceOptionSelection', async () => {
        const res =  await ChaiHttpRequestHepler.patch(
            `${apiEndPoint}/preferences-choices/selections/${customerPreferencesOptionSelection.id}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(201);
        expect(res.body).to.have.property('success');
        expect(res.body.selection.centsCustomerId).to.equal(centsCustomer.id);
    });

    it ('should return an error if CustomerPreferenceOptionSelection not found', async () => {
        const res =  await ChaiHttpRequestHepler.patch(
            `${apiEndPoint}/preferences-choices/selections/${-1}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
    });

    it('should return an error if bad request', async () => {
        const res =  await ChaiHttpRequestHepler.patch(
            `${apiEndPoint}/preferences-choices/selections/${undefined}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
    });
})

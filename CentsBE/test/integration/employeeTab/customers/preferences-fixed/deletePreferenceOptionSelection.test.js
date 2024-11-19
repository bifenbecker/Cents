require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper')
const {generateToken} = require('../../../../support/apiTestHelper')
const factory = require('../../../../factories')
const { expect } = require('../../../../support/chaiHelper');

describe('test deletePreferenceOptionSelection', () => {
    let store, payload, token, centsCustomer;
    const apiEndPoint = '/api/v1/employee-tab/customers';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
    });

    it('should delete CustomerPreferenceOptionSelection', async () => {
        const customerPreferencesOptionSelection = await factory.create('customerPreferencesOptionSelection', {
            centsCustomerId: centsCustomer.id,
        });
        const res =  await ChaiHttpRequestHepler.delete(
            `${apiEndPoint}/preferences-choices/selections/${customerPreferencesOptionSelection.id}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').equal(true);
        expect(res.body.selection.deletedAt).to.not.be.null;
        expect(res.body.selection.deletedAt).to.not.be.undefined;
        expect(res.body.selection.deletedAt).to.be.a.dateString();
        expect(res.body.selection.isDeleted).to.equal(true);
    });

    it('should return an error if CustomerPreferenceOptionSelection not found', async () => {
        const res =  await ChaiHttpRequestHepler.delete(
            `${apiEndPoint}/preferences-choices/selections/${-1}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error');
    });

    it('should return an error if bad request', async () => {
        const res =  await ChaiHttpRequestHepler.delete(
            `${apiEndPoint}/preferences-choices/selections/${undefined}`,
            {},
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
    });
})

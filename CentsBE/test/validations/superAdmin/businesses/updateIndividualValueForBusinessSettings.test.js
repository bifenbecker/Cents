require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const BusinessSettings = require('../../../../models/businessSettings');

const API_ENDPOINT = '/api/v1/super-admin/businesses/business/settings/update';

async function checkForResponseError({ body, token, code, expectedError }) {
    const response = await ChaiHttpRequestHelper.put(API_ENDPOINT, {}, body).set(
        'authtoken',
        token,
    );

    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test updateIndividualValueForBusinessSettings validation', () => {
    let token, business, user, sampleBody;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Super Admin' });
        user = await factory.create('userWithSuperAdminRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        token = generateToken({ id: user.id });
        sampleBody = {
            id: business.id,
            field: 'dryCleaningEnabled',
            value: false,
        };
    });

    it('should have status 200 when success', async () => {
        const res = await ChaiHttpRequestHelper.put(API_ENDPOINT, {}, sampleBody).set(
            'authtoken',
            token,
        );
        expect(res).to.have.status(200);
    });

    it('should have status 422 error if "field" is missing', async () => {
        delete sampleBody.field;
        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'child "field" fails because ["field" is required]',
        });
    });

    it('should fail when field is not a string', async () => {
        sampleBody.field = true;

        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'child "field" fails because ["field" must be a string]',
        });
    });

    it('should have status 422 error if "value" is missing', async () => {
        delete sampleBody.value;
        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'child "value" fails because ["value" is required]',
        });
    });

    it('should have status 422 error if "id" is missing', async () => {
        delete sampleBody.id;
        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'child "id" fails because ["id" is required]',
        });
    });

    it('should fail when id is not a number', async () => {
        sampleBody.id = "hello";

        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'child "id" fails because ["id" must be a number]',
        });
    });

    it('should fail when business does not exist', async () => {
        sampleBody.id = 0;

        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError: 'The business you are trying to update does not exist.',
        });
    });
});

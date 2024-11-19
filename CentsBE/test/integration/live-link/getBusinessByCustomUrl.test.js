require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const chaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const factory = require('../../factories');
const BusinessTheme = require('../../../models/businessTheme');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../constants/dbValues');
const { THEME_ERRORS } = require('../../../constants/error.messages');

const getApiEndpoint = (customUrl = '') => `/api/v1/live-status/business/custom/${customUrl}`;

describe('test getBusinessByCustomUrl endpoint', () => {
    const customUrl = 'custom-url';
    describe('should return correct response', () => {
        it('with business entity', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            await BusinessTheme.query().update({ customUrl }).where({ businessId: business.id });
            const apiEndpoint = getApiEndpoint(customUrl);
            const res = await chaiHttpRequestHelper.get(apiEndpoint);

            expect(res.status).equal(200);
            expect(res.body).have.property('success').to.be.true;
            expect(res.body).have.property('business').have.property('id', business.id);
        });
    });

    describe('should return error response', () => {
        it('with incorrect customUrl', async () => {
            const apiEndpoint = getApiEndpoint(MAX_DB_INTEGER);
            const res = await chaiHttpRequestHelper.get(apiEndpoint);

            expect(res.status).equal(400);
            expect(res.body).have.property('error', THEME_ERRORS.businessUndefined);
        });
    });
});

require('../../testHelper');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const BusinessTheme = require('../../../models/businessTheme');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const defaultBusinessTheme = require('../../../constants/businessOwner/defaultBusinessTheme');

const endpointName = 'live-status/business-theme/:businessId';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async (businessId) => {
    const currentApiEndpoint = apiEndpoint.replace(':businessId', businessId);
    const response = await ChaiHttpRequestHelper.get(currentApiEndpoint);

    return response;
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    it('should return response with business theme', async () => {
        const business = await factory.create(FN.laundromatBusiness);

        //business model automatically creates businessTheme in afterInsert hook
        const businessTheme = await BusinessTheme.query()
            .where({
                businessId: business.id,
            })
            .first();

        const {
            active,
            boldFont,
            borderRadius,
            logoUrl,
            normalFont,
            primaryColor,
            secondaryColor,
            id,
        } = businessTheme;

        const response = await makeRequest(business.id);
        const { theme } = response.body;

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('theme').to.not.be.empty;
        expect(theme).to.have.property('id').to.be.equal(id);
        expect(theme).to.have.property('businessId').to.be.equal(business.id);
        expect(theme).to.have.property('businessName').to.be.equal(business.name);
        expect(theme).to.have.property('active').to.be.equal(active);
        expect(theme).to.have.property('boldFont').to.be.equal(boldFont);
        expect(theme).to.have.property('borderRadius').to.be.equal(borderRadius);
        expect(theme).to.have.property('logoUrl').to.be.equal(logoUrl);
        expect(theme).to.have.property('normalFont').to.be.equal(normalFont);
        expect(theme).to.have.property('primaryColor').to.be.equal(primaryColor);
        expect(theme).to.have.property('secondaryColor').to.be.equal(secondaryColor);
    });

    it('should return defaultBusinessTheme when there is no laundromatBusiness', async () => {
        const unexistingBusinessId = 0;
        const response = await makeRequest(unexistingBusinessId);

        response.should.have.status(200);
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('theme').deep.equal(defaultBusinessTheme);
    });

    it('should return defaultBusinessTheme if businessId is invalid', async () => {
        const errorId = 'error1';
        const response = await makeRequest(errorId);

        response.should.have.status(200);
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('theme').deep.equal(defaultBusinessTheme);
    });
});

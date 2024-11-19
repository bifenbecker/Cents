require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const sinon = require('sinon');
const graphQLHelper = require('../../../../routes/businessOwner/analytics-dashboard/graphQLHelper');

const apiEndpoint = '/api/v1/business-owner/analytics-dashboard/graphql';

describe('test handleGraphQLQuery', () => {
    itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => apiEndpoint);

    it('should fail on invalid user role', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        const token = generateToken({
            id: user.id,
        });
        await assertPostResponseError({
            url: apiEndpoint,
            token,
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should succeed', async () => {
        const expectedData = {
            percentageChange: 0.35,
            totalTips: 103.5,
        };
        const graphQLHelperStub = sinon.stub(graphQLHelper, 'executeQuery').callsFake(() => ({
            data: expectedData,
        }));

        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const token = generateToken({
            id: user.id,
        });

        const response = await assertPostResponseSuccess({
            url: apiEndpoint,
            body: {
                query: `
                    query MyQuery {
                        getTotalTipsByDateRange(
                            input: {startDate: "2022-05-09T12:59:32.582Z", endDate: "2022-05-11T12:59:32.582Z", timeZone: "America/New_York", storeIds: 4}
                        ) {
                            percentageChange
                            totalTips
                        }
                    }  
                `,
            },
            token,
        });
        expect(response.body.success).to.be.true;
        expect(response.body.data).to.deep.equal(expectedData);

        graphQLHelperStub.restore();
    });

    it('should fail on invalid request query', async () => {
        const expectedErrors = [{
            message: 'Failed query, startDate is required'
        }]
        const graphQLHelperStub = sinon.stub(graphQLHelper, 'executeQuery').callsFake(() => ({ errors: expectedErrors }));

        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const token = generateToken({
            id: user.id,
        });

        const response = await assertPostResponseSuccess({
            url: apiEndpoint,
            body: {
                query: `
                    query MyQuery {
                        getTotalTipsByDateRange(
                            input: {endDate: "2022-05-11T12:59:32.582Z", timeZone: "America/New_York", storeIds: 4}
                        ) {
                            percentageChange
                            totalTips
                        }
                    }  
                `,
            },
            token,
        });
        expect(response.body.success).to.be.false;
        expect(response.body.errors).to.deep.equal(expectedErrors);

        graphQLHelperStub.restore();
    });
});

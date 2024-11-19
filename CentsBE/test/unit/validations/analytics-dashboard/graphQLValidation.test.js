require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { itShouldCorrectlyAssertTokenPresense, assertPostResponseError, assertPostResponseSuccess } = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const sinon = require('sinon');
const graphQLHelper = require('../../../../routes/businessOwner/analytics-dashboard/graphQLHelper');

const apiEndpoint = '/api/v1/business-owner/analytics-dashboard/graphql';

describe('test graphQLValidation', () => {
    itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => apiEndpoint);

    describe('with token', () => {
        let token;

        beforeEach(async () => {
            const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            token = generateToken({
                id: user.id
            });
        });

        it('should pass validation', async () => {
            const graphQLHelperStub = sinon.stub(graphQLHelper, 'executeQuery').callsFake(() => ({
                data: {
                    percentageChange: 0.35,
                    totalTips: 103.5,
                },
            }));

            await assertPostResponseSuccess({
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
                    `
                },
                token
            });

            graphQLHelperStub.restore();
        });
    
        it('should fail if query was not passed', async () => {
            await assertPostResponseError({
                url: apiEndpoint,
                token,
                code: 422,
                expectedError: '"query" is required'
            });
        });

        it('should fail if query is not a string', async () => {
            await assertPostResponseError({
                url: apiEndpoint,
                token,
                body: {
                    query: 123
                },
                code: 422,
                expectedError: '"query" must be a string'
            });
        });
    });
});
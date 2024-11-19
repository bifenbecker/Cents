require('../../../testHelper');
const sinon = require('sinon');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect, chai } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const stripe = require('../../../../routes/stripe/config');

const BASE_URL = '/api/v1/super-admin/stripe-account';

describe('test stripeAccountController APIs', () => {
    describe('test API to update payment statement descriptor', () => {
        let authToken, user, url;        

        beforeEach(async () => {
            await factory.create('role', { userType: 'Super Admin' });
            user = await factory.create('userWithSuperAdminRole');

            authToken = generateToken({ id: user.id });

            url = `${BASE_URL}/update-statement-descriptor`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should update payment statement descriptor', async () => {
            const payload = {
              id: 'acc_34345sfsdf35432',
              value: 'trycents.com',
            };

            sinon.stub(stripe.accounts, 'update').callsFake(() => ({
              settings: {
                payments: {
                  statement_descriptor: payload.value.toUpperCase(),
                },
              },
            }));

            const updateDescriptorSpy = chai.spy.on(stripe.accounts, 'update');

            const res = await ChaiHttpRequestHelper.post(url, null, payload).set('authtoken', authToken);

            res.should.have.status(200);  
            expect(updateDescriptorSpy).to.have.been.called.with(payload.id, { 
              settings: {
                  payments: {
                      statement_descriptor: payload.value,
                  },
              },
            });
            expect(res.body.success).to.be.true;
            expect(res.body.statementDescriptor).to.exist;
            expect(res.body.statementDescriptor).to.equal(payload.value.toUpperCase());
        });
    });
});

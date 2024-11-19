require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

describe('test updateReportingAccessible API', () => {
  let user, authToken, business, store;
  beforeEach(async () => {
    await factory.create(FN.role, {
      userType: 'Business Owner'
    });
    user = await factory.create(FN.userWithBusinessOwnerRole);
    business = await factory.create(FN.laundromatBusiness, {
      userId: user.id,
    });
    store = await factory.create(FN.store, {
      businessId: business.id,
    });
    authToken = generateToken({
      id: user.id,
    });
  });

  describe('Without auth token', () => {
    it('should return Unauthorized when no auth token provided', async () => {
      const response = await ChaiHttpRequestHepler
        .patch(`/api/v1/business-owner/admin/locations/${store.id}/reporting-accessible`)
        .set('authtoken', '');
      response.should.have.status(401);
      expect(response.body).to.have.property('error').equal('Please sign in to proceed.');
    });
  });

  describe('With auth token', async () => {
    it('should update hasAppReportingAccessible and return the current value', async () => {
      const body = {
        hasAppReportingAccessible: true,
      };
      const response = await ChaiHttpRequestHepler
        .patch(
          `/api/v1/business-owner/admin/locations/${store.id}/reporting-accessible`, {},
          body,
        )
        .set('authtoken', authToken);
      expect(response.body.hasAppReportingAccessible).to.equal(body.hasAppReportingAccessible);
      expect(response.body.success).to.equal(true);
    });
  });

});

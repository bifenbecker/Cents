require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const EsdReader = require('../../../../models/esdReader');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test getEsdReaderForStore API', () => {
  const apiEndPoint = '/api/v1/employee-tab/esd/card-reader';

  it('should throw an error if token is not sent', async () => {
      const res = await ChaiHttpRequestHepler.get(
          apiEndPoint,
      ).set('authtoken', '');
      res.should.have.status(401);
  });

  it('should return store not found error', async () => {
      const token = await getToken(0);
      const res = await ChaiHttpRequestHepler.get(
          apiEndPoint,
      ).set('authtoken', token);
      res.should.have.status(403);
  });

  it('should return a single ESD Reader for a given store successfully', async () => {
      const business = await factory.create('laundromatBusiness');
      const store = await factory.create('store', { businessId: business.id });
      const token = await getToken(store.id);
      await factory.create('esdReader', { storeId: store.id });
      const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
          'authtoken',
          token,
      );
      
      // verify 200 status
      res.should.have.status(200);

      // verify response body matches the reader in question
      const foundReader = await EsdReader.query().where('storeId', store.id).first();
      expect(res.body.reader.id).to.equal(foundReader.id);
      expect(res.body.reader.esdLocationId).to.equal(foundReader.esdLocationId);
      expect(res.body.reader.deviceSerialNumber).to.equal(foundReader.deviceSerialNumber);
  });
});


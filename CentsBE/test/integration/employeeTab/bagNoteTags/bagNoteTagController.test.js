require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test bagNotesController', () => {
  describe('test fetch all bagNoteTag API', () => {
      const apiEndPoint = '/api/v1/employee-tab/bag-note-tags/all';

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

      it('should return a list of bagNoteTag entries successfully', async () => {
          const business = await factory.create('laundromatBusiness');
          const store = await factory.create('store', { businessId: business.id });
          const token = await getToken(store.id);
          const bagNoteTags = await factory.createMany(
              'bagNoteTag',
              5,
              { businessId: business.id },
          );
          const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`).set(
              'authtoken',
              token,
          );
          
          // verify 200 status
          res.should.have.status(200);

          // verify all entries for business are returned
          expect(Number(res.body.bagNoteTags.length)).to.equal(5);

          // verify data is correct
          for (const tag of bagNoteTags) {
              const responseTag = res.body.bagNoteTags.find(t => t.id === tag.id);
              expect(responseTag).to.deep.include(tag);
          }
      });
  });
});


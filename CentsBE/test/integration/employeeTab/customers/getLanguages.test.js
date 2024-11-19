require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
     return `/api/v1/employee-tab/customers/languages`;
 }

describe('test getLanguages api', () => {
     let store, token;

     beforeEach(async () => {
         store = await factory.create('store');
         token = generateToken({ id: store.id });
     });

     it('should throw an error if token is not sent', async () => {
         const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
         const { error } = JSON.parse(response.text);
         response.should.have.status(401);
         expect(error).to.equal('Please sign in to proceed.');
     });

     it('should throw an error if store from token was not found', async () => {
         const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set(
             'authtoken',
             generateToken({
                 id: -1,
             }),
         );
         const { error } = JSON.parse(response.text);
         response.should.have.status(403);
         expect(error).to.equal('Store not found');
     });

     it('should throw an error if token is not correct', async () => {
         const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '123678a');
         const { error } = JSON.parse(response.text);
         response.should.have.status(401);
         expect(error).to.equal('Invalid token.');
     });

     it('should return 200 if value is sent', async () => {
         const language = await factory.create('language');
         const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);
         response.should.have.status(200);
         expect(response.body.languages[0].id).to.equal(language.id);
     });

})
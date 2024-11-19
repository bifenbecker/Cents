require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test /api/v1/employee-tab/printer', () => {
    const apiEndPoint = '/api/v1/employee-tab/printer/settings/save';

    describe('test fetch printer API return values', async () => {
        let store, token;

        beforeEach(async () => {
            // Create business, store, and token
            const business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            token = await getToken(store.id);
        });

        it('should throw an error if token is not sent', async () => {
            // request with no token
            const res = await ChaiHttpRequestHelper.post(apiEndPoint).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should return a response with the original printerConnectionType', async () => {
            // get origin printerConnectionType
            const res = await ChaiHttpRequestHelper.post(apiEndPoint).set('authtoken', token);
            const { printerConnectionType } = res.body;

            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(printerConnectionType).to.equal('bluetooth');
        });

        it('should update, return, and persists the printerConnectionType', async () => {
            // update printerConnectionType
            const newPrinterConnectionType = 'ethernet';
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, null, {
                printerConnectionType: newPrinterConnectionType,
            }).set('authtoken', token);
            const { printerConnectionType } = res.body;

            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(printerConnectionType).to.equal(newPrinterConnectionType);

            // check that updated printerConnectionType persists
            const response = await ChaiHttpRequestHelper.post(apiEndPoint).set('authtoken', token);
            const persistedPrinterConnectionType = response.body.printerConnectionType;

            response.should.have.status(200);
            expect(response.body.success).to.equal(true);
            expect(persistedPrinterConnectionType).to.equal(newPrinterConnectionType);
        });
    });
});

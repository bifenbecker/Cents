require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test /api/v1/employee-tab/tax', () => {
    const apiEndPoint = '/api/v1/employee-tab/tax';
    describe('test fetch tax API status error codes', () => {

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', '');

            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

            res.should.have.status(403);
        });
    });

    describe('test fetch tax API return values', async() => {
        let business, randomIdx, businessId, stores, token, taxRate, res, returnedTaxId;
        const numOfVariance = 10;
        beforeEach(async() => {
            // Create 10 businesses for variance
            business = await factory.createMany('laundromatBusiness', numOfVariance);
            // Grab a random id to use to grab a random business
            randomIdx = Math.floor(Math.random() * numOfVariance);
            businessId = business[randomIdx].id;

            // Map out an array of businessId objects to create 10 associated stores
            const businessIdArr = business.map(obj => ({ businessId: obj.id }));
            stores = await factory.createMany('store', numOfVariance, businessIdArr);
            const currStore = stores.find(obj => obj.businessId === businessId);

            // Grab tax rate from currStore
            taxRate = await currStore.getTaxRate();

            // Generate auth token for currStore
            token = await getToken(currStore.id);
            res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`).set(
                'authtoken',
                token,
            );
            returnedTaxId = res.body.id;

        })

        it('response should be successful and return a 200 status code', () => {
            // verify 200 status
            res.should.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should return a response with the correct tax rate, tax agency and tax rate id', () => {
            // verify data is correct
            const returnedtaxRate = res.body.rate;
            const returnedTaxAgency = res.body.taxAgency;

            expect(returnedtaxRate).to.equal(taxRate.rate);
            expect(returnedTaxAgency).to.equal(taxRate.taxAgency);
            expect(returnedTaxId).to.equal(taxRate.id);
        })

        it('should NOT return another businesses tax rate id', async () => {
            const secondBusiness = business.find(obj => obj.id !== businessId);
            const secondStore = stores.find(obj => obj.businessId === secondBusiness.id);
            const secondTaxRate = await secondStore.getTaxRate();

            expect(returnedTaxId).to.not.equal(secondTaxRate.id);
            expect(secondBusiness.id).to.not.equal(businessId);
        })
    
    })
});

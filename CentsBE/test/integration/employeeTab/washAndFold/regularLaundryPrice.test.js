require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

describe('test regularLaundryPrice', () => {
    let store, token, centsCustomer, serviceOrder, serviceCategory, serviceMaster, servicePrice;
    const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/price';

    beforeEach(async () => {
        store = await factory.create('store')
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        serviceCategory = await factory.create('serviceCategory', {
            businessId: store.businessId,
        });
        serviceMaster  = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
        });
        servicePrice = await factory.create('servicePrice', {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndPoint,
    );

    it('should return laundryPrice without queryParams', async () => {
        const res =  await ChaiHttpRequestHepler.get(apiEndPoint)
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('laundryPrice');
        expect(res.body.laundryPrice[0]).to.have.property('priceId').to.equal(servicePrice.id);
        expect(res.body.laundryPrice[0]).to.have.property('category').to.equal('FIXED_PRICE');
        expect(res.body.laundryPrice[0]).to.have.property('serviceId').to.equal(serviceMaster.id);
    });

    it('should return laundryPrice with queryParams', async () => {
        const res =  await ChaiHttpRequestHepler.get(apiEndPoint, {
            category: serviceCategory.category,
            orderId: serviceOrder.id,
            centsCustomerId: centsCustomer.id,
        })
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('laundryPrice');
        expect(res.body.laundryPrice[0]).to.have.property('priceId').to.equal(servicePrice.id);
        expect(res.body.laundryPrice[0]).to.have.property('category').to.equal(serviceCategory.category);
        expect(res.body.laundryPrice[0]).to.have.property('serviceId').to.equal(serviceMaster.id);
        expect(res.body.laundryPrice[0]).to.have.property('price').to.equal(servicePrice.storePrice);
    });
})

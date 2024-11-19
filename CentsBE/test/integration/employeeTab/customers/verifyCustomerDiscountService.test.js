require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
     return `/api/v1/employee-tab/customers/discounts`;
 }

describe('test verifyCustomerDiscountService api', () => {
    let store, token, centsCustomer, laundromatBusiness, storeCustomer;

    beforeEach(async () => {
         laundromatBusiness = await factory.create('laundromatBusiness');
         centsCustomer = await factory.create('centsCustomer');
         store = await factory.create('store');
         storeCustomer = await factory.create('storeCustomer', {
             storeId: store.id,
             businessId: laundromatBusiness.id,
             centsCustomerId: centsCustomer.id,
         });
         token = generateToken({ id: store.id });
    });

    it('should throw an error if token was not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set(
             'authtoken',
             '',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
         const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set(
             'authtoken',
             'invalid_token',
         );
         const { error } = JSON.parse(response.text);
         response.should.have.status(401);
         expect(error).to.equal('Invalid token.');
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

    it('should verify customer discount service successfully', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            storeCustomerId: storeCustomer.id,
        });
        const serviceMaster = await factory.create('serviceMaster', {
            name: 'test Discount name',
            description: '123description',
        });
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        const servicePrice = await factory.create('servicePrice', {
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
            servicePriceId: servicePrice.id,
            orderItemId: serviceOrderItem.id,
            serviceId: serviceMaster.id,
        });

        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(), { customerId: storeCustomer.id }).set(
            'authtoken',
            token,
        );
        response.should.have.status(200);
        expect(response.body.customerReferenceItems[0].referenceItemId).to.eq(serviceReferenceItem.id);
        expect(response.body.customerReferenceItems[0].serviceName).to.eq(serviceMaster.name);
    });

    it('should throw an error if customerId not passed', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint()).set(
            'authtoken',
            token,
        );
        response.should.have.status(500);
    });
});
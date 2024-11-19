const sinon = require('sinon');
require('../../testHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    generateLiveLinkCustomerToken,
    classicVersion,
    dryCleaningVersion,
} = require('../../support/apiTestHelper');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const {
  createLaundryAndDryCleaningServices,
  createServicePrice,
} = require('../../support/services/serviceHelper');
const BusinessSettings = require('../../../models/businessSettings');

describe('test onlineOrderController APIs for integration tests', () => {
    describe('test getTurnaroundTimeForCategories API', () => {
        const apiEndpoint = '/api/v1/live-status/categories/turnaround-time';

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHelper.get(apiEndpoint);
                res.should.have.status(401);
            });

            it('should respond with a 404 when customerauthtoken is invalid', async () => {
                const token = generateLiveLinkCustomerToken({ id: 100 });
                const res = await ChaiHttpRequestHelper.get(apiEndpoint).set(
                    'customerauthtoken',
                    token,
                );
                res.should.have.status(404);
            });
        });

        describe('when auth token is valid', () => {
            let token;
            let centsCustomer;
            let business;

            beforeEach(async () => {
                business = await factory.create('laundromatBusiness');
                centsCustomer = await factory.create('centsCustomer');
                token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
            });

            it('should retrieve the proper turnaround time', async () => {
              const services = await createLaundryAndDryCleaningServices(business.id);
              const res = await ChaiHttpRequestHelper.get(apiEndpoint, { businessId: business.id }).set(
                  'customerauthtoken',
                  token,
              );
              const { laundryCategory, dryCleaningCategory } = services;

              // assert status and value - actual logic is in UoW tests
              expect(res.body.success).to.be.true;
              expect(res.body.washAndFoldTurnaroundTime).to.equal(laundryCategory.turnAroundInHours);
              expect(res.body.dryCleaningTurnaroundTime).to.equal(dryCleaningCategory.turnAroundInHours);
            });

            it('should throw an error if a field is missing', async () => {
                const res = await ChaiHttpRequestHelper.get(apiEndpoint).set(
                  'customerauthtoken',
                  token,
                );

                res.should.have.status(500);
                expect(res.text).to.include("Cannot read property 'id' of undefined");
            });
        });
    });

    describe('test getStoreFeaturedServices API', () => {
        const apiEndpoint = '/api/v1/live-status/stores';
        let token;
        let centsCustomer;
        let business;
        let store;
        let businessCustomer;

        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            centsCustomer = await factory.create('centsCustomer');
            businessCustomer = await factory.create('businessCustomer', {
              businessId: business.id,
              centsCustomerId: centsCustomer.id,
            });
            token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        });

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${store.id}/featured-services`);
                res.should.have.status(401);
            });

            it('should respond with a 404 when customerauthtoken is invalid', async () => {
                const token = generateLiveLinkCustomerToken({ id: 100 });
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${store.id}/featured-services`).set(
                    'customerauthtoken',
                    token,
                );
                res.should.have.status(404);
            });
        });

        describe('when auth token is valid', () => {
            it('should retrieve a list of services if version is not 2.0.0', async () => {
              const fixedPriceCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'FIXED_PRICE',
              });
              const service = await factory.create('serviceMaster',{
                serviceCategoryId: fixedPriceCategory.id,
              });
              await createServicePrice(store.id, service.id);
              const res = await ChaiHttpRequestHelper.get(
                  `${apiEndpoint}/${store.id}/featured-services`,
                  { type: 'FIXED_PRICE', zipCode: [94133] },
              ).set('customerauthtoken', token).set('version', classicVersion);

              // assert status and value - actual logic is in UoW tests
              expect(res.body.success).to.be.true;
              expect(res.body.services.length).to.equal(1);
              expect(res.body.laundry).to.deep.equal([]);
              expect(res.body.dryCleaning).to.deep.equal([]);
              expect(res.body.products).to.deep.equal([]);
            });

            it('should retrieve a list of services if version is 2.0.0 but flag is off', async () => {
              const fixedPriceCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'FIXED_PRICE',
              });
              const service = await factory.create('serviceMaster',{
                serviceCategoryId: fixedPriceCategory.id,
              });
              await createServicePrice(store.id, service.id);
              const res = await ChaiHttpRequestHelper.get(
                  `${apiEndpoint}/${store.id}/featured-services`,
                  { type: 'FIXED_PRICE', zipCode: [94133] },
              ).set('customerauthtoken', token).set('version', classicVersion);

              // assert status and value - actual logic is in UoW tests
              expect(res.body.success).to.be.true;
              expect(res.body.services.length).to.equal(1);
              expect(res.body.laundry).to.deep.equal([]);
              expect(res.body.dryCleaning).to.deep.equal([]);
              expect(res.body.products).to.deep.equal([]);
            });

            it('should retrieve a list of all services and products if version is 2.0.0', async () => {
              await BusinessSettings.query()
                  .patch({
                      dryCleaningEnabled: true,
                  })
                  .findOne({ businessId: business.id });
              
              // Create laundry and dry cleaning services
              const categories = await createLaundryAndDryCleaningServices(business.id);
              const { laundryCategory, dryCleaningCategory } = categories;
              const laundryService = await factory.create('serviceMaster',{
                serviceCategoryId: laundryCategory.id,
              });
              const dryCleaningService = await factory.create('serviceMaster',{
                serviceCategoryId: dryCleaningCategory.id,
              });
              await createServicePrice(store.id, laundryService.id);
              await createServicePrice(store.id, dryCleaningService.id);

              // create a product
              const productCategory = await factory.create('inventoryCategory', { 
                businessId: business.id
              });
              const inventory = await factory.create('inventory', {
                categoryId: productCategory.id,
              })
              await factory.create('inventoryItem', {
                storeId: store.id,
                inventoryId: inventory.id,
              });

              // create regular fixed-price service
              const fixedPriceCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'FIXED_PRICE',
              });
              const fixedPriceService = await factory.create('serviceMaster',{
                serviceCategoryId: fixedPriceCategory.id,
              });
              await createServicePrice(store.id, fixedPriceService.id);

              // API call
              const res = await ChaiHttpRequestHelper.get(
                  `${apiEndpoint}/${store.id}/featured-services`,
                  { type: 'FIXED_PRICE', zipCode: [94133] },
              ).set('customerauthtoken', token).set('version', dryCleaningVersion);

              // assert status
              expect(res.body.success).to.be.true;
              
              // assert services data
              expect(res.body.services.length).to.equal(1);

              // assert laundry data
              expect(res.body.laundry.length).to.equal(2);

              // assert dry cleaning data
              expect(res.body.dryCleaning.length).to.equal(1);
              
              // assert products data
              expect(res.body.products.length).to.equal(1);
            });

            it('should retrieve a list of services when businessCustomer is empty if version is not 2.0.0', async () => {
                const newCentsCustomer = await factory.create('centsCustomer');
                const newToken = generateLiveLinkCustomerToken({ id: newCentsCustomer.id });
                const fixedPriceCategory = await factory.create('serviceCategory', {
                    businessId: business.id,
                    category: 'FIXED_PRICE',
                });
                const service = await factory.create('serviceMaster', {
                    serviceCategoryId: fixedPriceCategory.id,
                });
                await createServicePrice(store.id, service.id);
                const res = await ChaiHttpRequestHelper.get(
                    `${apiEndpoint}/${store.id}/featured-services`,
                    { type: 'FIXED_PRICE', zipCode: [94133] },
                )
                    .set('customerauthtoken', newToken)
                    .set('version', classicVersion);

                // assert status and value - actual logic is in UoW tests
                expect(res.body.success).to.be.true;
                expect(res.body.services.length).to.equal(1);
                expect(res.body.laundry).to.deep.equal([]);
                expect(res.body.dryCleaning).to.deep.equal([]);
                expect(res.body.products).to.deep.equal([]);
            });

            it('should retrieve a list of all services and products when businessCustomer is empty if version is 2.0.0 and flag is on', async () => {
              await BusinessSettings.query()
                .patch({
                  dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });

              // Create customer and token
              const newCentsCustomer = await factory.create('centsCustomer');
              const newToken = generateLiveLinkCustomerToken({ id: newCentsCustomer.id });
              
              // Create laundry and dry cleaning services
              const categories = await createLaundryAndDryCleaningServices(business.id);
              const { laundryCategory, dryCleaningCategory } = categories;
              const laundryService = await factory.create('serviceMaster',{
                serviceCategoryId: laundryCategory.id,
              });
              const dryCleaningService = await factory.create('serviceMaster',{
                serviceCategoryId: dryCleaningCategory.id,
              });
              await createServicePrice(store.id, laundryService.id);
              await createServicePrice(store.id, dryCleaningService.id);

              // create a product
              const productCategory = await factory.create('inventoryCategory', { 
                businessId: business.id
              });
              const inventory = await factory.create('inventory', {
                categoryId: productCategory.id,
              })
              await factory.create('inventoryItem', {
                storeId: store.id,
                inventoryId: inventory.id,
              });

              // create regular fixed-price service
              const fixedPriceCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'FIXED_PRICE',
              });
              const fixedPriceService = await factory.create('serviceMaster',{
                serviceCategoryId: fixedPriceCategory.id,
              });
              await createServicePrice(store.id, fixedPriceService.id);

              // API call
              const res = await ChaiHttpRequestHelper.get(
                  `${apiEndpoint}/${store.id}/featured-services`,
                  { type: 'FIXED_PRICE', zipCode: [94133] },
              ).set('customerauthtoken', newToken).set('version', dryCleaningVersion);

              // assert status
              expect(res.body.success).to.be.true;
              
              // assert services data
              expect(res.body.services.length).to.equal(1);

              // assert laundry data
              expect(res.body.laundry.length).to.equal(2);

              // assert dry cleaning data
              expect(res.body.dryCleaning.length).to.equal(1);
              
              // assert products data
              expect(res.body.products.length).to.equal(1);
            });
        });
    });
});

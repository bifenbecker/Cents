require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const StoreSettings = require('../../../models/storeSettings');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { deliveryPriceTypes } = require('../../../constants/constants');

const endpointName = 'live-status/stores/:storeId/deliverable-services';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async ({ storeId, zipCode, centsCustomerId, type }) => {
    const customerauthtoken = generateLiveLinkCustomerToken({
        id: centsCustomerId,
    });

    const currentApiEndpoint = apiEndpoint.replace(':storeId', storeId);
    const response = await ChaiHttpRequestHelper.get(currentApiEndpoint, {
        zipCode,
        type,
    }).set({
        customerauthtoken,
    });

    return response;
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    it('should return correct response with status 200', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const commercialTier = await factory.create(FN.pricingTier, {
            businessId: business.id,
        });
        const store = await factory.create(FN.store, {
            businessId: business.id,
        });
        await StoreSettings.query()
            .patch({
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
                deliveryTierId: commercialTier.id,
            })
            .where({
                storeId: store.id,
            });

        const centsCustomer = await factory.create(FN.centsCustomer);
        await factory.create(FN.businessCustomer, {
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            isCommercial: false,
            commercialTierId: commercialTier.id,
        });
        const ownDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });
        const zone = await factory.create(FN.zone, {
            ownDeliverySettingsId: ownDeliverySettings.id,
            deliveryTierId: commercialTier.id,
        });
        await factory.create(FN.centsDeliverySettings, {
            storeId: store.id,
            active: true,
            doorDashEnabled: true,
        });
        const serviceCategory = await factory.create(FN.serviceCategory, {
            businessId: business.id,
            category: 'TEST TYPE',
        });
        const service = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
            isDeleted: false,
            hasMinPrice: false,
        });
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: store.id,
            serviceId: service.id,
            pricingTierId: commercialTier.id,
            isFeatured: true,
            isDeliverable: true,
            isTaxable: true,
        });
        const modifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        const serviceModifier = await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifier.id,
            isFeatured: true,
        });

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            zipCode: zone.zipCodes[0],
            type: serviceCategory.category,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('services').to.be.lengthOf(1);

        const responseService = response.body.services[0];
        expect(responseService).to.have.property('defaultPrice').to.be.equal(service.defaultPrice);
        expect(responseService).to.have.property('description').to.be.equal(service.description);
        expect(responseService).to.have.property('hasMinPrice').to.be.equal(service.hasMinPrice);
        expect(responseService).to.have.property('isDeleted').to.be.equal(service.isDeleted);
        expect(responseService).to.have.property('minPrice').to.be.equal(service.minPrice);
        expect(responseService).to.have.property('minQty').to.be.equal(service.minQty);
        expect(responseService).to.have.property('name').to.be.equal(service.name);
        expect(responseService)
            .to.have.property('serviceCategoryId')
            .to.be.equal(serviceCategory.id);
        expect(responseService).to.have.property('serviceCategory').to.be.eql({
            category: 'FIXED_PRICE',
        });

        const responsePrice = responseService.prices[0];
        expect(responseService).to.have.property('prices').to.be.lengthOf(1);
        expect(responsePrice)
            .to.have.property('isDeliverable')
            .to.be.equal(servicePrice.isDeliverable);
        expect(responsePrice).to.have.property('isFeatured').to.be.equal(servicePrice.isFeatured);
        expect(responsePrice).to.have.property('isTaxable').to.be.equal(servicePrice.isTaxable);
        expect(responsePrice).to.have.property('minPrice').to.be.equal(servicePrice.minPrice);
        expect(responsePrice).to.have.property('minQty').to.be.equal(servicePrice.minQty);
        expect(responsePrice)
            .to.have.property('pricingTierId')
            .to.be.equal(servicePrice.pricingTierId);
        expect(responsePrice).to.have.property('serviceId').to.be.equal(servicePrice.serviceId);
        expect(responsePrice).to.have.property('storeId').to.be.equal(servicePrice.storeId);
        expect(responsePrice).to.have.property('storePrice').to.be.equal(servicePrice.storePrice);

        const responseServiceModifiers = responseService.serviceModifiers[0];
        expect(responseService).to.have.property('serviceModifiers').to.be.lengthOf(1);
        expect(responseServiceModifiers)
            .to.have.property('isFeatured')
            .to.be.equal(serviceModifier.isFeatured);

        const responseModifier = responseServiceModifiers.modifier;
        expect(responseServiceModifiers).to.have.property('modifier').to.not.be.empty;
        expect(responseModifier).to.have.property('businessId').to.be.equal(modifier.businessId);
        expect(responseModifier).to.have.property('description').to.be.equal(modifier.description);
        expect(responseModifier).to.have.property('name').to.be.equal(modifier.name);
        expect(responseModifier).to.have.property('price').to.be.equal(modifier.price);
    });

    it('should return empty services field when servicesMaster has isDeleted field that equals to true', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: business.id,
        });
        const commercialTier = await factory.create(FN.pricingTier, {
            businessId: business.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        await factory.create(FN.businessCustomer, {
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            isCommercial: true,
            commercialTierId: commercialTier.id,
        });
        await factory.create(FN.centsDeliverySettings, {
            storeId: store.id,
            active: true,
            doorDashEnabled: true,
        });

        const serviceCategory = await factory.create(FN.serviceCategory, {
            businessId: business.id,
            category: 'TEST TYPE',
        });
        const service = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
            isDeleted: true,
            hasMinPrice: false,
        });
        await factory.create(FN.servicePrice, {
            storeId: store.id,
            serviceId: service.id,
            pricingTierId: commercialTier.id,
            isFeatured: true,
            isDeliverable: true,
            isTaxable: true,
        });
        const modifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifier.id,
            isFeatured: true,
        });

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('services').to.be.eql([]);
    });

    it('should return empty services field when there is no BusinessCustomer', async () => {
        const store = await factory.create(FN.store);
        const commercialTier = await factory.create(FN.pricingTier);
        const centsCustomer = await factory.create(FN.centsCustomer);
        await factory.create(FN.centsDeliverySettings, {
            storeId: store.id,
            active: true,
            doorDashEnabled: true,
        });

        await StoreSettings.query()
            .patch({
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
                deliveryTierId: commercialTier.id,
            })
            .where({
                storeId: store.id,
            });

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body).to.have.property('services').to.be.eql([]);
    });

    it('should catch error when dealing with unprovided error', async () => {
        const store = await factory.create(FN.store);
        const centsCustomer = await factory.create(FN.centsCustomer);

        const errorMessage = 'Unprovided error';
        sinon.stub(StoreSettings, 'query').throws(new Error(errorMessage));

        const response = await makeRequest({
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
        });

        response.should.have.status(500);
        expect(response.body).to.have.property('error').to.be.equal(errorMessage);
    });
});

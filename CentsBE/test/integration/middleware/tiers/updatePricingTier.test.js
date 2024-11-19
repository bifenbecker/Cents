require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { pricingTierPayload, pricingTierUpdatePayload } = require('../../../support/pricingTierPayloadHelper');

describe('test updatePricingTierValidations', () => {
    let user, teamMember, payload, token, serviceCategory,
    service, inventoryCategory, inventory, business,tier;
    const createTierApi = '/api/v1/business-owner/admin/tiers/create';
    const updateServicePriceApi = '/api/v1/business-owner/admin/tiers/service-price';
    const updateProductPriceApi = '/api/v1/business-owner/admin/tiers/product-price';

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        teamMember = await factory.create('teamMember', { userId: user.id,  businessId: business.id });
        serviceCategory = await factory.create('serviceCategory', {businessId: business.id});
        service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id
        });
        await factory.create('servicePrice', {
            serviceId: service.id
        });
        inventoryCategory = await factory.create('inventoryCategory', {
            businessId: business.id
        });
        inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id
        });
        await factory.create('inventoryItem', {
            inventoryId: inventory.id
        });

        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
    })

    it('should throw an error no token to service price update api', async () => {
        payload = {};
        const res = await ChaiHttpRequestHepler.patch(`${updateServicePriceApi}/`, {}, payload)
        .set('authtoken', '');
        res.should.have.status(401);
    })
    it('should throw an error if all service/product isFeatured false', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        tier = (await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token)).body.tierDetails;

        payload = pricingTierUpdatePayload(tier.id, 'serviceId', service.id);
        const res = await ChaiHttpRequestHepler.patch(`${updateServicePriceApi}/`, {}, payload)
        .set('authtoken', token);
        res.should.have.status(422);
        res.body.should.have.property('error').to.equal('At least one deliverable service must be available for sale in order to update a pricing tier.');
    })

    it('should update service isFeatured false', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        payload.inventoryPrices[0].isFeatured = true;
        payload.servicePrices.push({
            storePrice: 22,
            isFeatured: true,
            minQty: 12,
            minPrice: 2,
            serviceId: service.id,
            isDeliverable: true,
        });
        tier = (await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token)).body.tierDetails;

        payload = pricingTierUpdatePayload(tier.id, 'serviceId', service.id);
        const res = await ChaiHttpRequestHepler.patch(`${updateServicePriceApi}/`, {}, payload)
        .set('authtoken', token);
        expect(res.body.success).to.equal(true);
        expect(res.body.record.isFeatured).to.equal(false);
    })

    it('should throw an error no token to product price update api', async () => {
        payload = {};
        const res = await ChaiHttpRequestHepler.patch(`${updateProductPriceApi}/`, {}, payload)
        .set('authtoken', '');
        res.should.have.status(401);
    })
    it('should throw an error if all service/product isFeatured false', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        payload.inventoryPrices[0].isFeatured = true;
        payload.servicePrices[0].isFeatured = true;
        tier = (await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token)).body.tierDetails;

        payload = pricingTierUpdatePayload(tier.id, 'inventoryId', inventory.id);
        const res = await ChaiHttpRequestHepler.patch(`${updateProductPriceApi}/`, {}, payload)
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body.record.isFeatured).to.equal(false);
    })

    it('should update product to isFeatured false', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        payload.inventoryPrices[0].isFeatured = true;
        tier = (await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token)).body.tierDetails;

        payload = pricingTierUpdatePayload(tier.id, 'inventoryId', inventory.id);
        const res = await ChaiHttpRequestHepler.patch(`${updateProductPriceApi}/`, {}, payload)
        .set('authtoken', token);
        expect(res.body.success).to.equal(true);
        expect(res.body.record.isFeatured).to.equal(false);
    })
})

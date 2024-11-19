require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { pricingTierPayload } = require('../../../support/pricingTierPayloadHelper');

describe('test createPricingTierValidations', () => {
    let user, teamMember, payload, token, serviceCategory,
    service, inventoryCategory, inventory, business;
    const createTierApi = '/api/v1/business-owner/admin/tiers/create';

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

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', '');
        res.should.have.status(401);
    })
    it('should throw an error if all service/products isFeatured false', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        payload.servicePrices[0].isFeatured = false;
        const res = await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token);
        res.should.have.status(422);
        res.body.should.have.property('error').to.equal('At least one service must be selected to create a pricing tier');
    })
    it('should create a tier', async () => {
        payload = pricingTierPayload(service.id, inventory.id);
        const res = await ChaiHttpRequestHepler.post(`${createTierApi}/`, {}, payload)
        .set('authtoken', token);
        expect(res.body.tierDetails).to.have.property('id');
        expect(res.body.tierDetails.name).to.equal(payload.name);
    })
})

require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');

describe('test createPricingTierValidations', () => {
    let payload, token, serviceCategory, service, business, deliverableServicePrice, nonDeliverableServicePrice;
    const apiEndPoint = '/api/v1/business-owner/admin/tiers';

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        teamMember = await factory.create('teamMember', { userId: user.id,  businessId: business.id });
        serviceCategory = await factory.create('serviceCategory', {businessId: business.id});
        service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id
        });
        deliverableServicePrice = await factory.create('deliverableServicePrice', {
            serviceId: service.id
        });
        nonDeliverableServicePrice = await factory.create('nonDeliverableServicePrice', {
            serviceId: service.id
        });

        token = generateToken({
            id: user.id,
            role: 1,
            teamMemberId: teamMember.id,
        });
    })

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHepler.put(`${apiEndPoint}/${deliverableServicePrice.id}/deliverable-services`, {}, payload)
        .set('authtoken', '');
        res.should.have.status(401);
    })
    it('should throw an error if prices are not provided', async () => {
        const res = await ChaiHttpRequestHepler.put(`${apiEndPoint}/${deliverableServicePrice.id}/deliverable-services`, {}, {})
        .set('authtoken', token);
        expect(res.body).to.haveOwnProperty('error');
        expect(res.body.error).to.equal('Service prices are required to update the deliverable status');
    })
    it('should change deliverable services to non deliverable for a tier', async () => {
        payload = {
            prices : [
                {
                    id: deliverableServicePrice.id,
                    isDeliverable: false
                }
            ]
        };
        const res = await ChaiHttpRequestHepler.put(`${apiEndPoint}/${deliverableServicePrice.id}/deliverable-services`, {}, payload)
        .set('authtoken', token);
        expect(res.body).to.haveOwnProperty('success');
        expect(res.body.success).to.be.true;
    })
})

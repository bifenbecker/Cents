require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const ServiceItem = require('../../../../models/servicePrices');
const updateTierDeliverableServicesUow = require('../../../../uow/pricingTiers/updateTierDeliverableServicesUow');

describe('test updateTierDeliverableServicesUow', () => {
    let store, service, serviceCategoy;

    beforeEach(async () => {
        store = await factory.create('store');
        serviceCategoy = await factory.create('serviceCategory', {businessId: store.businessId});
        service = await factory.create('serviceMaster', {serviceCategoryId: serviceCategoy.id});
        deliverableServicePrice = await factory.create('deliverableServicePrice', {serviceId: service.id});
        nonDeliverableServicePrice = await factory.create('nonDeliverableServicePrice', {serviceId: service.id});
    });

    it('should make deliverable service as non-deliverable for a tier', async () => {
        expect(deliverableServicePrice.isDeliverable).to.be.true;
        const prices = [
            {
                id : deliverableServicePrice.id,
                isDeliverable: false,
            }
        ];
        await updateTierDeliverableServicesUow({prices: [
            {
                id : deliverableServicePrice.id,
                isDeliverable: false,
            }
        ]});
        const response = await ServiceItem.query().where('id', deliverableServicePrice.id);
        expect(response[0].id).to.equal(deliverableServicePrice.id);
        expect(response[0].isDeliverable).to.be.false;
    });

    it('should make non-deliverable service as deliverable for a tier', async () => {
        expect(nonDeliverableServicePrice.isDeliverable).to.be.false;
        const prices = [
            {
                id : nonDeliverableServicePrice.id,
                isDeliverable: true,
            }
        ];
        await updateTierDeliverableServicesUow({prices: [
            {
                id : nonDeliverableServicePrice.id,
                isDeliverable: true,
            }
        ]});
        const response = await ServiceItem.query().where('id', nonDeliverableServicePrice.id);
        expect(response[0].id).to.equal(nonDeliverableServicePrice.id);
        expect(response[0].isDeliverable).to.be.true;
    });
});

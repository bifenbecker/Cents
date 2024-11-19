require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const ServiceItem = require('../../../../models/servicePrices');
const createServicePricesUow = require('../../../../uow/pricingTiers/createServicePricesUow');

describe('test createServicePricesUow', () => {
    let result, store, service, serviceCategoy;

    beforeEach(async () => {
        store = await factory.create('store');
        serviceCategoy = await factory.create('serviceCategory', {businessId: store.businessId});
        service = await factory.create('serviceMaster', {serviceCategoryId: serviceCategoy.id});
        tier = await factory.create('pricingTierDelivery', {businessId: store.businessId});
    });

    it('should create a service price', async () => {
        const servicePrices = [
            {
                storePrice: 23,
                isFeatured: false,
                minQty: 12,
                minPrice: 2,
                serviceId: service.id,
                storeId: store.id,
                pricingTierId: tier.id,
            }
        ];
        result = await createServicePricesUow({
            businessId: store.businessId,
            id: tier.id,
            type:'DELIVERY',
            name: 'Tier name',
            servicePrices,
        });
        const servicePricesResponse = await ServiceItem.query().where('pricingTierId', tier.id);
        expect(servicePricesResponse.length).to.equal(servicePrices.length);
    });

    it('should create a service price if all required fields are not passed', async () => {
        const servicePrices = [
            {
                storePrice: 23,
                isFeatured: false,
                minQty: 12,
                minPrice: 2,
                serviceId: service.id,
                storeId: store.id,
                pricingTierId: tier.id,
            }
        ];
        result = await createServicePricesUow({
            servicePrices,
        });
        const servicePricesResponse = await ServiceItem.query().where('pricingTierId', tier.id);
        expect(servicePricesResponse.length).to.equal(0);
    });
});

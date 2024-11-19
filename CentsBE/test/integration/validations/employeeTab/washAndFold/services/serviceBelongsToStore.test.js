require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const serviceBelongsToStore = require('../../../../../../validations/employeeTab/services/serviceBelongsToStore');

describe('test serviceBelongsToStore validation', () => {
    let business, serviceCategory, service, servicePrice;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
        });
        service = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
            serviceId: service.id,
        })
    })
    
    it('should return true if service belongs to the store/business', async () => {
        const belongsToStore = await serviceBelongsToStore(business.id, servicePrice.id);
        expect(belongsToStore).to.be.true;
    });

    it('should return false if service does not belong to the store/business', async () => {
        const newBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        const belongsToStore = await serviceBelongsToStore(newBusiness.id, servicePrice.id);
        expect(belongsToStore).to.be.false;
    });
});

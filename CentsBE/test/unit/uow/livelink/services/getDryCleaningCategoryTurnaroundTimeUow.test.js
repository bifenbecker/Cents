require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const ServiceCategoryType = require('../../../../../models/serviceCategoryType');
const ServiceCategory = require('../../../../../models/serviceCategories');

const getDryCleaningCategoryTurnaroundTime = require('../../../../../uow/liveLink/services/getDryCleaningCategoryTurnaroundTimeUow');

describe('test getDryCleaningCategoryTurnaroundTime UoW', () => {
    let serviceCategoryType, business, serviceCategory;

    beforeEach(async () => {
        serviceCategoryType = await factory.create('serviceCategoryType', {
          type: 'DRY_CLEANING',
        });
        business = await factory.create('laundromatBusiness');
        serviceCategory = await factory.create('serviceCategory', {
          businessId: business.id,
          serviceCategoryTypeId: serviceCategoryType.id,
          category: 'Dry Cleaning Category',
          turnAroundInHours: 48,
        });
    });

    it('should fetch the turnaround time for a DRY_CLEANING ServiceCategory', async () => {
        const payload = { businessId: business.id };

        // call Uow
        const uowOutput = await getDryCleaningCategoryTurnaroundTime(payload);
        const { dryCleaningTurnaroundTime } = uowOutput;

        // assert
        const foundServiceCategoryType = await ServiceCategoryType.query().findOne({ type: 'DRY_CLEANING' });
        const foundServiceCategory = await ServiceCategory.query()
          .findOne({
            serviceCategoryTypeId: foundServiceCategoryType.id,
            businessId: payload.businessId,
          });
        expect(dryCleaningTurnaroundTime).to.exist;
        expect(dryCleaningTurnaroundTime).to.equal(foundServiceCategory.turnAroundInHours);
    });
});

require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const ServiceCategoryType = require('../../../../../models/serviceCategoryType');
const ServiceCategory = require('../../../../../models/serviceCategories');

const getWashAndFoldCategoryTurnaroundTime = require('../../../../../uow/liveLink/services/getWashAndFoldCategoryTurnaroundTimeUow');

describe('test getWashAndFoldCategoryTurnaroundTime UoW', () => {
    let serviceCategoryType, business, serviceCategory;

    beforeEach(async () => {
        serviceCategoryType = await factory.create('serviceCategoryType', {
          type: 'LAUNDRY',
        });
        business = await factory.create('laundromatBusiness');
        serviceCategory = await factory.create('serviceCategory', {
          businessId: business.id,
          serviceCategoryTypeId: serviceCategoryType.id,
          category: 'PER_POUND',
          turnAroundInHours: 24,
        });
    });

    it('should fetch the turnaround time for a WashAndFold/PER_POUND ServiceCategory', async () => {
        const payload = { businessId: business.id };

        // call Uow
        const uowOutput = await getWashAndFoldCategoryTurnaroundTime(payload);
        const { washAndFoldTurnaroundTime } = uowOutput;

        // assert
        const foundServiceCategoryType = await ServiceCategoryType.query().findOne({ type: 'LAUNDRY' });
        const foundServiceCategory = await ServiceCategory.query()
          .findOne({
            serviceCategoryTypeId: foundServiceCategoryType.id,
            businessId: payload.businessId,
            category: 'PER_POUND',
          });
        expect(washAndFoldTurnaroundTime).to.exist;
        expect(washAndFoldTurnaroundTime).to.equal(foundServiceCategory.turnAroundInHours);
    });
});

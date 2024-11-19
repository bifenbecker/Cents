const ServiceCategoryType = require('../../models/serviceCategoryType');
const ServiceCategories = require('../../models/serviceCategories');
const StoreSettings = require('../../models/storeSettings');
const { serviceCategoryTypes } = require('../../constants/constants');

async function getTurnAroundForCents20(store) {
    const { id: storeId, businessId } = store;
    const storeSettings = await StoreSettings.query().findOne({ storeId });

    const laundryCategoryType = await ServiceCategoryType.query().findOne({
        type: serviceCategoryTypes.LAUNDRY,
    });
    const { turnAroundInHours: laundryTurnAroundInHours } = await ServiceCategories.query().findOne(
        {
            businessId,
            serviceCategoryTypeId: laundryCategoryType.id,
        },
    );

    let dryCleaningTurnAroundInHours = null;
    if (storeSettings?.offerDryCleaningForDelivery) {
        const dryCleaningCategoryType = await ServiceCategoryType.query().findOne({
            type: serviceCategoryTypes.DRY_CLEANING,
        });
        const dryCleaningCategory = await ServiceCategories.query().findOne({
            businessId,
            serviceCategoryTypeId: dryCleaningCategoryType.id,
        });
        dryCleaningTurnAroundInHours = dryCleaningCategory?.turnAroundInHours;
    }

    const turnAroundInHours = Math.max(laundryTurnAroundInHours, dryCleaningTurnAroundInHours);
    return { turnAroundInHours, dryCleaningTurnAroundInHours, laundryTurnAroundInHours };
}

module.exports = { getTurnAroundForCents20 };

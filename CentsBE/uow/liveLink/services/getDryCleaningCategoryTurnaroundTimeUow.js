const ServiceCategoryType = require('../../../models/serviceCategoryType');
const ServiceCategory = require('../../../models/serviceCategories');
const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Fetch the turnaroundInHours for a given business for DRY_CLEANING ServiceCategoryType
 *
 * @param {Object} payload
 */
async function getDryCleaningCategoryTurnaroundTime(payload) {
    try {
        const newPayload = payload;
        const { transaction, businessId } = newPayload;

        const dryCleaningServiceCategoryType = await ServiceCategoryType.query(transaction).findOne(
            {
                type: serviceCategoryTypes.DRY_CLEANING,
            },
        );
        const dryCleaningCategory = await ServiceCategory.query(transaction).findOne({
            serviceCategoryTypeId: dryCleaningServiceCategoryType.id,
            businessId,
        });

        newPayload.dryCleaningTurnaroundTime = dryCleaningCategory.turnAroundInHours;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getDryCleaningCategoryTurnaroundTime;

const ServiceCategoryType = require('../../../models/serviceCategoryType');
const ServiceCategory = require('../../../models/serviceCategories');
const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Fetch the turnaroundInHours for a given business for DRY_CLEANING ServiceCategoryType
 *
 * @param {Object} payload
 */
async function getWashAndFoldCategoryTurnaroundTime(payload) {
    try {
        const newPayload = payload;
        const { transaction, businessId } = newPayload;

        const laundryServiceCategoryType = await ServiceCategoryType.query(transaction).findOne({
            type: serviceCategoryTypes.LAUNDRY,
        });
        const washAndFoldCategory = await ServiceCategory.query(transaction).findOne({
            serviceCategoryTypeId: laundryServiceCategoryType.id,
            businessId,
            category: 'PER_POUND',
        });

        newPayload.washAndFoldTurnaroundTime = washAndFoldCategory.turnAroundInHours;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getWashAndFoldCategoryTurnaroundTime;

const ServiceCategoryType = require('../../../models/serviceCategoryType');
const ServiceCategory = require('../../../models/serviceCategories');

const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Create an individual ServiceCategory based on type
 *
 * @param {String} category
 * @param {Number} businessId
 * @param {Number} laundryCategoryId
 * @param {void} trx
 */
async function createIndividualServiceCategory(category, businessId, laundryCategoryId, trx) {
    await ServiceCategory.query(trx).insert({
        category,
        businessId,
        imageUrl: null,
        deletedAt: null,
        serviceCategoryTypeId: laundryCategoryId,
    });
}

/**
 * Use incoming payload to create default service categories.
 *
 * The logic should be as follows:
 *
 * 1) check to see whether the business already has the categories we are going to create
 * 2a) if they do, then skip.
 * 2b) if not, then create laundry categories
 *
 * @param {Object} payload
 */
async function createDefaultLaundryServiceCategories(payload) {
    try {
        const newPayload = payload;
        const { transaction, businessId } = newPayload;
        const laundryTypes = ['PER_POUND', 'FIXED_PRICE'];

        const laundryCategoryType = await ServiceCategoryType.query(transaction).findOne({
            type: serviceCategoryTypes.LAUNDRY,
        });
        const currentLaundryCategories = await ServiceCategory.query(transaction).where({
            serviceCategoryTypeId: laundryCategoryType.id,
            businessId,
        });

        if (currentLaundryCategories.length > 0) {
            return newPayload;
        }

        const newLaundryCategories = laundryTypes.map((type) =>
            createIndividualServiceCategory(type, businessId, laundryCategoryType.id, transaction),
        );

        await Promise.all(newLaundryCategories);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createDefaultLaundryServiceCategories;

const ServiceCategoryType = require('../../../models/serviceCategoryType');
const ServiceCategory = require('../../../models/serviceCategories');

const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Create an individual ServiceCategory based on type
 *
 * @param {String} category
 * @param {Number} businessId
 * @param {Number} dryCleaningCategoryId
 * @param {void} trx
 */
async function createIndividualServiceCategory(category, businessId, dryCleaningCategoryId, trx) {
    await ServiceCategory.query(trx).insert({
        category,
        businessId,
        imageUrl: null,
        deletedAt: null,
        serviceCategoryTypeId: dryCleaningCategoryId,
    });
}

/**
 * Use incoming payload to create default service categories.
 *
 * The logic should be as follows:
 *
 * 1) check to see whether the business already has the categories we are going to create
 * 2a) if they do, then skip.
 * 2b) if not, then create dry cleaning categories
 *
 * @param {Object} payload
 */
async function createDefaultLaundryServiceCategories(payload) {
    try {
        const newPayload = payload;
        const { transaction, businessId } = newPayload;
        const dryCleaningTypes = ['CLOTHING', 'BEDDING', 'MISC.'];

        const dryCleaningCategoryType = await ServiceCategoryType.query(transaction).findOne({
            type: serviceCategoryTypes.DRY_CLEANING,
        });
        const currentDryCleaningCategories = await ServiceCategory.query(transaction).where({
            serviceCategoryTypeId: dryCleaningCategoryType.id,
            businessId,
        });

        if (currentDryCleaningCategories.length > 0) {
            return newPayload;
        }

        const newDryCleaningCategories = dryCleaningTypes.map((type) =>
            createIndividualServiceCategory(
                type,
                businessId,
                dryCleaningCategoryType.id,
                transaction,
            ),
        );

        await Promise.all(newDryCleaningCategories);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createDefaultLaundryServiceCategories;

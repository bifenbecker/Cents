const ServiceCategories = require('../../models/serviceCategories');
const ServiceCategoryType = require('../../models/serviceCategoryType');
const { deliveryServices, serviceCategoryTypes } = require('../../constants/constants');

async function createCategories(businessId, transaction) {
    const laundryCategoryType = await ServiceCategoryType.query(transaction).findOne({
        type: serviceCategoryTypes.LAUNDRY,
    });

    const currentLaundryCategories = await ServiceCategories.query(transaction).where({
        serviceCategoryTypeId: laundryCategoryType.id,
        businessId,
    });

    const newCategories = [];

    if (currentLaundryCategories.every((category) => category.category !== 'PER_POUND')) {
        newCategories.push({
            category: 'PER_POUND',
            businessId,
            serviceCategoryTypeId: laundryCategoryType.id,
        });
    }

    if (currentLaundryCategories.every((category) => category.category !== 'FIXED_PRICE')) {
        newCategories.push({
            category: 'FIXED_PRICE',
            businessId,
            serviceCategoryTypeId: laundryCategoryType.id,
        });
    }

    if (currentLaundryCategories.every((category) => category.category !== 'DELIVERY')) {
        newCategories.push({
            category: 'DELIVERY',
            businessId,
            serviceCategoryTypeId: laundryCategoryType.id,
            services: Object.values(deliveryServices).map((deliveryService) => ({
                defaultPrice: 1,
                name: deliveryService,
                minQty: null,
                minPrice: null,
                hasMinPrice: false,
            })),
        });
    }

    if (newCategories.length) {
        await ServiceCategories.query(transaction).insertGraph(newCategories);
    }
}

module.exports = exports = createCategories;

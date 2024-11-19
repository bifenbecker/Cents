require('../../testHelper');
const factory = require('../../factories');

/**
 * Create standard dry cleaning and laundry services
 * 
 * @param {Number} businessId
 * @param {Number} laundryCategoryValue
 */
 async function createLaundryAndDryCleaningServices(businessId, laundryCategoryValue = 'PER_POUND') {
  const laundryCategoryType = await factory.create('serviceCategoryType');
  const laundryCategory = await factory.create('serviceCategory', {
    serviceCategoryTypeId: laundryCategoryType.id,
    businessId,
    category: laundryCategoryValue,
    turnAroundInHours: 24,
  });
  const dryCleaningCategoryType = await factory.create('serviceCategoryType', {
    type: 'DRY_CLEANING'
  });
  const dryCleaningCategory = await factory.create('serviceCategory', {
    serviceCategoryTypeId: dryCleaningCategoryType.id,
    businessId,
    category: 'Dry Cleaning Service',
    turnAroundInHours: 48,
  });
  
  return {
    laundryCategory,
    dryCleaningCategory
  };
};

/**
 * Create a ServicePrice model
 * 
 * @param {*} storeId
 * @param {*} serviceId
 */
async function createServicePrice(storeId, serviceId) {
  const price = await factory.create('servicePrice', {
    storeId,
    serviceId,
  });
  return price;
}

module.exports = {
  createLaundryAndDryCleaningServices,
  createServicePrice,
};

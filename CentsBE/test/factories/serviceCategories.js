const { factory } = require('factory-girl');
const ServiceCategories = require('../../models/serviceCategories');
require('./laundromatBusinesses');

factory.define('serviceCategory', ServiceCategories, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    serviceCategoryTypeId: factory.assoc('serviceCategoryType', 'id'),
    category: 'FIXED_PRICE'
});

factory.extend('serviceCategory', 'perPoundServiceCategory', {
    category: 'PER_POUND',
    serviceCategoryTypeId: factory.assoc('serviceCategoryType', 'id'),
})

module.exports = exports = factory;

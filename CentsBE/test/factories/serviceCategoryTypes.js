const { factory } = require('factory-girl');
const ServiceCategoryType = require('../../models/serviceCategoryType');
const FindOrCreateAdapter = require('../support/findOrCreateAdapter');

factory.define('serviceCategoryType', ServiceCategoryType, {
    type: 'LAUNDRY',
});
factory.setAdapter(new FindOrCreateAdapter('type'), 'serviceCategoryType');


module.exports = exports = factory

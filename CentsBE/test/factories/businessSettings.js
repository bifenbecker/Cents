const { factory } = require('factory-girl');
const BusinessSettings = require('../../models/businessSettings');
require('./laundromatBusinesses');

factory.define('businessSetting', BusinessSettings, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    hasConvenienceFee: true,
    requiresEmployeeCode: false,
});

module.exports = exports = factory;

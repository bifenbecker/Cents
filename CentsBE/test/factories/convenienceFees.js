const { factory } = require('factory-girl');
const ConvenienceFee = require('../../models/convenienceFee');
require('./laundromatBusinesses');

factory.define('convenienceFee', ConvenienceFee, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    feeType: 'PERCENTAGE',
    fee: 5,
    isDeleted: false,
});

module.exports = exports = factory;

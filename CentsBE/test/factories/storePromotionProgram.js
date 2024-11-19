const { factory } = require('factory-girl');
const StorePromotionProgram = require('../../models/storePromotionProgram');
require('./promotions');
require('./laundromatBusinesses');

factory.define('storePromotionProgram', StorePromotionProgram, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    storeId: factory.assoc('store', 'id'),
    businessPromotionProgramId: factory.assoc('promotion', 'id'),
});

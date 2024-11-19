const { factory } = require('factory-girl');
const PromotionProgramItem = require('../../models/promotionProgramItem');
require('./promotions');
require('./laundromatBusinesses');

factory.define('promotionProgramItem', PromotionProgramItem, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    businessPromotionProgramId: factory.assoc('promotion', 'id'),
});

factory.extend('promotionProgramItem', 'promotionInventoryItems', {
    promotionItemType: 'Inventory',
});

factory.extend('promotionProgramItem', 'promotionServiceItems', {
    promotionItemType: 'ServicesMaster',
});

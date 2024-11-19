const { factory } = require('factory-girl');
const BusinessPromotionProgram = require('../../models/businessPromotionProgram');
require('./laundromatBusinesses');

factory.define('promotion', BusinessPromotionProgram, (buildOptions) => {
    let attrs = {
        businessId: factory.assoc('laundromatBusiness', 'id'),
        name: 'promo',
        promotionType: 'fixed-price-discount',
        currency: 'USD',
        discountValue: 5,
        locationEligibilityType: 'any-location',
        appliesToType: 'specific-items',
        activeDays: JSON.stringify([
            {
                day: 'sunday',
            },
        ]),
    };

    if (buildOptions.withExpiredDate) {
        attrs.endDate = new Date(Date.now() - 1).toISOString();
    }

    if (buildOptions.withBeforeStartDate) {
        const dayInMs = 86400000;
        attrs.startDate = new Date(Date.now() + dayInMs).toISOString();
    }

    return attrs;
});

factory.extend('promotion', 'entireOrderPromo', {
    appliesToType: 'entire-order',
});

factory.extend('promotion', 'specificItemsPromo', {
    appliesToType: 'specific-items',
});

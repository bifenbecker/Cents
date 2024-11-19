const { factory } = require('factory-girl');
const TipSetting = require('../../models/tipSettings');
require('./laundromatBusinesses');

factory.define('tipSetting', TipSetting, {
    tipType: 'DOLLAR_AMOUNT',
    tipDollars: JSON.stringify({
        option1: 1,
        option2: 5,
        option3: 10,
    }),
    tipPercentage: JSON.stringify({
        option1: 1,
        option2: 5,
        option3: 10,
    }),
    businessId: factory.assoc('laundromatBusiness', 'id'),
});

module.exports = exports = factory;

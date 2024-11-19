const TipSettings = require('../models/tipSettings');

function findPercentageTipOption(tipAmount, netOrderTotal, options) {
    // find the min difference option.
    const orderTotalForTip = netOrderTotal - tipAmount;
    let min = Number.MAX_VALUE;
    let element = 0;
    for (const i of Object.keys(options)) {
        const calculatedValue = Number(((orderTotalForTip * options[i]) / 100).toFixed(2));
        const diff = tipAmount - calculatedValue;
        if (Math.abs(diff) < min) {
            min = Math.abs(diff);
            element = options[i];
        }
    }
    return `${element}%`;
}

async function findTipOption(tipAmount, netOrderTotal, businessId) {
    const tipOptions = await TipSettings.query().findOne({
        businessId,
    });
    if (tipOptions) {
        const { tipType, tipPercentage } = tipOptions;
        if (tipType === 'DOLLAR_AMOUNT') {
            return `$${tipAmount}`;
        }
        return findPercentageTipOption(tipAmount, netOrderTotal, tipPercentage);
    }
    return null;
}

module.exports = exports = findTipOption;

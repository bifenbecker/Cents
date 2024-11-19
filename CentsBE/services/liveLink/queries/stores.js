const {
    getEncodedBusinessIdType,
    incrementalIdDecrypt,
} = require('../../../utils/encoders/incrementalIdEncode');
const StoreTheme = require('../../../models/storeTheme');
const TipSetting = require('../../../models/tipSettings');
const BusinessSettings = require('../../../models/businessSettings');
const BusinessTheme = require('../../../models/businessTheme');

async function getBusinessTheme(encodedId) {
    const { customThemeLink, businessId } = getEncodedBusinessIdType(encodedId);

    let unformattedTheme;
    if (businessId) {
        unformattedTheme = await BusinessTheme.query()
            .withGraphJoined('business')
            .where({ businessId })
            .orderBy('createdAt')
            .first();
    } else if (customThemeLink) {
        unformattedTheme = await BusinessTheme.query()
            .withGraphJoined('business')
            .where({ customUrl: customThemeLink })
            .orderBy('createdAt')
            .first();
    }
    if (!unformattedTheme) {
        return null;
    }
    const {
        business: { name },
        ...businessTheme
    } = unformattedTheme;
    const theme = { ...businessTheme, name };
    return theme;
}

function mapTipSettings(settings) {
    const { tipType, tipPercentage, tipDollars } = settings;
    const tipOptions =
        tipType === 'PERCENTAGE'
            ? Object.values(tipPercentage).map((i) => `${Number(i).toFixed(2)}%`)
            : Object.values(tipDollars).map((i) => `$${Number(i).toFixed(2)}`);
    return {
        tipType,
        tipOptions,
    };
}

async function getBusinessSettings(businessId, trx) {
    const settings = await BusinessSettings.query(trx).findOne({
        businessId,
    });
    return settings;
}

async function getTipSettings(businessId, trx) {
    const businessSettings = await getBusinessSettings(businessId);
    if (businessSettings && businessSettings.allowInStoreTip) {
        const tipSettings = await TipSetting.query(trx).findOne({
            businessId,
        });
        if (tipSettings) {
            return mapTipSettings(tipSettings);
        }
    }
    return {
        tipType: '',
        tipOptions: [],
    };
}

async function getStoreTheme(storeId, trx) {
    const theme = await StoreTheme.query(trx).findOne({
        storeId,
    });
    return theme;
}

async function getStoreThemeByEncodedId(encodedId) {
    const id = incrementalIdDecrypt(encodedId);
    let themeWithStore;
    if (id) {
        themeWithStore = await StoreTheme.query()
            .withGraphFetched('[store, business]')
            .findById(id);
    } else {
        themeWithStore = await StoreTheme.query()
            .withGraphFetched('[store, business]')
            .where({
                customUrl: encodedId,
            })
            .first();
    }

    const {
        store: { name },
        ...storeTheme
    } = themeWithStore;

    return { ...storeTheme, name };
}

async function getSettings(storeId, businessId, trx) {
    const businessTheme = await getBusinessTheme(businessId, trx);
    const storeTheme = await getStoreTheme(storeId, trx);
    const tipSettings = await getTipSettings(businessId, trx);

    if (storeTheme) {
        return {
            ...tipSettings,
            theme: {
                ...storeTheme,
                businessName: businessTheme.businessName,
            },
        };
    }

    return {
        ...tipSettings,
        theme: businessTheme,
    };
}

module.exports = exports = {
    getSettings,
    getTipSettings,
    getBusinessTheme,
    getStoreTheme,
    getStoreThemeByEncodedId,
};

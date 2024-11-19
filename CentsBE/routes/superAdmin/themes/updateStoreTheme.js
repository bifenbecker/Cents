const Store = require('../../../models/store');
const StoreTheme = require('../../../models/storeTheme');
const getCustomUrlObj = require('../../../utils/superAdmin/getCustomUrlObj');

async function updateStoreTheme(req, res, next) {
    try {
        const {
            body: { name: newName, customUrl, storeId, ...newThemeProperties },
            params: { themeId },
        } = req;

        const customUrlObj = getCustomUrlObj(customUrl);

        await StoreTheme.query()
            .patch({
                ...newThemeProperties,
                ...customUrlObj,
            })
            .findById(themeId);

        if (newName) {
            await Store.query().patch({ name: newName }).findById(storeId);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateStoreTheme;

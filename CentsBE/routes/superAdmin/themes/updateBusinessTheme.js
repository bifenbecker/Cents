const BusinessTheme = require('../../../models/businessTheme');
const StoreTheme = require('../../../models/storeTheme');
const getCustomUrlObj = require('../../../utils/superAdmin/getCustomUrlObj');
const { THEME_ERRORS } = require('../../../constants/error.messages');

async function updateBusinessTheme(req, res, next) {
    try {
        const {
            body: { customUrl, initialTheme, ...themeProperties },
            params: { themeId },
        } = req;

        const customUrlObj = getCustomUrlObj(customUrl);

        const newBusinessTheme = await BusinessTheme.query().patchAndFetchById(themeId, {
            ...themeProperties,
            ...customUrlObj,
        });

        if (!newBusinessTheme) {
            res.status(400).json({
                error: THEME_ERRORS.noSuchTheme,
            });
            return;
        }

        await StoreTheme.query()
            .patch(themeProperties)
            .where({ businessId: newBusinessTheme.businessId, ...initialTheme })
            .returning('*');

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateBusinessTheme;

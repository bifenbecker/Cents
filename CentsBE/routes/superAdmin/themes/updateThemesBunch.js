const StoreTheme = require('../../../models/storeTheme');
const BusinessTheme = require('../../../models/businessTheme');

async function updateThemesBunch(req, res, next) {
    try {
        const {
            body: { storeThemeIds, businessThemeId, ...updatedThemeProperties },
        } = req;

        await StoreTheme.query().patch(updatedThemeProperties).findByIds(storeThemeIds);

        if (businessThemeId) {
            await BusinessTheme.query().patch(updatedThemeProperties).findById(businessThemeId);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateThemesBunch;

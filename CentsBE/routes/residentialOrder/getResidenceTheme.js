const StoreTheme = require('../../models/storeTheme');

/**
 * Get the theme for the specific Residential location
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getResidenceTheme(req, res, next) {
    try {
        const { id } = req.params;
        const storeTheme = await StoreTheme.query().findOne({
            storeId: id,
            active: true,
        });

        return res.json({
            success: true,
            storeTheme,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getResidenceTheme;

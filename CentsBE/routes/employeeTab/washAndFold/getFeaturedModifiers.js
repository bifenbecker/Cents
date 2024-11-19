const { getFeaturedModifiers } = require('../../../services/washServices/modifiers/queries');

async function getModifiers(req, res, next) {
    try {
        const { serviceId } = req.params;
        const { orderId } = req.query;
        const featuredModifiers = await getFeaturedModifiers(serviceId, orderId);
        res.status(200).json({
            success: true,
            featuredModifiers,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getModifiers;

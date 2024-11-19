const ServiceModifier = require('../../../../models/serviceModifiers');

async function patchServiceModifier(req, res, next) {
    try {
        const { serviceModifierId } = req.params;
        const { isFeatured } = req.body;
        await ServiceModifier.query()
            .patch({
                isFeatured,
            })
            .findById(serviceModifierId);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = patchServiceModifier;

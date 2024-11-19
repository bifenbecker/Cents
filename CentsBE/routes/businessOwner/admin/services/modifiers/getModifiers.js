const ServiceModifiers = require('../../../../../models/serviceModifiers');

async function getModifiers(req, res, next) {
    try {
        const { serviceId } = req.params;
        const modifiers = await ServiceModifiers.query()
            .select(
                'serviceModifiers.id as serviceModifierId',
                'modifiers.name',
                'modifiers.id as modifierId',
                'modifiers.description',
                'modifiers.price',
                'serviceModifiers.isFeatured',
            )
            .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
            .where('serviceId', '=', serviceId)
            .orderBy('modifiers.name');
        res.status(200).json({
            success: true,
            modifiers,
        });
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getModifiers;

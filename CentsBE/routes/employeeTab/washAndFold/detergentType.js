const DetergentType = require('../../../models/detergentType');

async function getDetergentTypes(req, res, next) {
    try {
        const detergents = await DetergentType.query();
        res.json({
            success: true,
            detergentTypes: detergents,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getDetergentTypes;

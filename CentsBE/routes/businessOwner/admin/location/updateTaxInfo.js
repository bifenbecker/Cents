const Store = require('../../../../models/store');

async function updateTaxInfo(req, res, next) {
    try {
        const { id } = req.params;
        await Store.query().patch(req.body).where({ id });
        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = updateTaxInfo;

const Store = require('../../../../models/store');

async function updateStorePassword(req, res, next) {
    try {
        const { id } = req.params;
        await Store.query()
            .patch({
                password: req.body.password,
            })
            .findById(id);
        res.status(200).json({
            success: true,
        });
        return;
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateStorePassword;

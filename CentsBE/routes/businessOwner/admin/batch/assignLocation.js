const Batch = require('../../../../models/batch');
const Store = require('../../../../models/store');

const addLocation = async (req, res, next) => {
    try {
        const batch = await Batch.query().findById(req.body.batchId);
        const store = await Store.query().findById(req.body.storeId);

        if (!batch || !store) {
            res.status(422).json({
                error: 'Invalid batch or location',
            });
            return;
        }

        if (batch.storeId) {
            res.status(422).json({
                error: 'Batch is already assigned to a location',
            });
            return;
        }
        // TODO test
        await batch.$query().patch({
            storeId: store.id,
        });
        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = addLocation;

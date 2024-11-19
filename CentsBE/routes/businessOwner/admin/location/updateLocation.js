const Store = require('../../../../models/store');
const eventEmitter = require('../../../../config/eventEmitter');

function createInsertObject(req) {
    return {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        districtId: req.body.districtId ? req.body.districtId : null,
    };
}
const updateLocation = async (req, res, next) => {
    try {
        const locationId = req.query.id;
        const insertObject = createInsertObject(req);
        // Update the store
        const updatedStore = await Store.query()
            .patch(insertObject)
            .findOne('id', locationId)
            .returning('*');
        eventEmitter.emit('storeUpdated', locationId);
        res.json({
            success: true,
            updatedStore: {
                ...updatedStore,
                district: req.district ? req.district[0] : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = updateLocation;

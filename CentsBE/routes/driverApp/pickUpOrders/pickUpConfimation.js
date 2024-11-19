const pickUpconfirmationForDeliveryPipeline = require('../../../pipeline/driverApp/pickUpconfirmationForDeliveryPipeline');

async function orderPickUpConfirmation(req, res, next) {
    try {
        const { decodedToken } = req.locals;
        const payload = {
            driverId: decodedToken.teamMemberId,
            ...req.body,
        };
        const orderList = await pickUpconfirmationForDeliveryPipeline(payload);
        res.status(200).json({
            success: true,
            ...orderList,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = orderPickUpConfirmation;

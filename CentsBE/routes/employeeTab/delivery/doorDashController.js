const getDoorDashDetailsUOW = require('../../../uow/doorDash/getDoorDashDeliveryDetails');
/**
 * Retrieve the details for an individual DoorDash delivery
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getDoorDashDeliveryDetails(req, res, next) {
    try {
        const { id } = req.params;

        const response = await getDoorDashDetailsUOW({ id });

        return res.json({
            success: true,
            doorDashDelivery: response.doorDashDelivery,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { getDoorDashDeliveryDetails };

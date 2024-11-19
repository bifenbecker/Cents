// Models
const User = require('../../../models/user');
const { REPORT_TYPES } = require('../../../constants/constants');

// Events
const eventEmitter = require('../../../config/eventEmitter');

/**
 * Export a list of customers for a given business and set of locations
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function exportCustomerList(req, res, next) {
    try {
        const { timeZone, stores, userId } = req.query;
        const recipient = await User.query().findById(userId);
        const options = {
            timeZone,
            stores,
            storeCount: stores.length,
        };
        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.allCustomersList,
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { exportCustomerList };

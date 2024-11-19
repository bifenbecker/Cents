const getBusiness = require('../../../utils/getBusiness');
const assignedStoreIds = require('../../../utils/getAssignedStoreIds');
const User = require('../../../models/user');
const eventEmitter = require('../../../config/eventEmitter');
const { REPORT_TYPES } = require('../../../constants/constants');

async function getTransactionsReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const queryParams = req.query;
        const { startDate, endDate, timeZone, stores, status } = queryParams;
        const allStoresCheck = queryParams.allStoresCheck === 'true';
        let allStoreIds = [];
        if (allStoresCheck) {
            allStoreIds = await assignedStoreIds(
                req.teamMemberId,
                req.currentUser.role,
                business.id,
            );
            if (!allStoreIds.length) {
                throw new Error('No assigned Locations');
            }
        }

        const recipient = await User.query().findById(req.currentUser.id);

        const options = {
            startDate,
            endDate,
            timeZone,
            stores,
            status,
            allStoresCheck,
            businessId: business.id,
            allStoreIds,
        };

        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.transactionsReport,
        });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { getTransactionsReport };

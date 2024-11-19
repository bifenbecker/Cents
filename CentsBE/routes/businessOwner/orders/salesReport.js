const getBusiness = require('../../../utils/getBusiness');
const assignedStoreIds = require('../../../utils/getAssignedStoreIds');
const { getReportOptions } = require('../../../utils/reports/reportsUtils');
const User = require('../../../models/user');
const { REPORT_TYPES } = require('../../../constants/constants');

// Events
const eventEmitter = require('../../../config/eventEmitter');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function getSalesReport(req, res, next) {
    try {
        const business = await getBusiness(req);

        if (!business) {
            const errMsg = 'Invalid request. No business exists';
            LoggerHandler('error', errMsg, req);

            return res.status(400).json({
                error: errMsg,
            });
        }

        let allStoreIds = [];
        const { tz, stores, status, allStoresCheck, startDate, endDate, userId } = req.query;
        const recipient = await User.query().findById(userId);

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

        const options = getReportOptions({
            allStoreIds,
            allStoresCheck,
            endDate,
            startDate,
            status,
            stores,
            tz,
            businessId: business.id,
        });

        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.salesDetailReport,
        });

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = getSalesReport;

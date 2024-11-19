const moment = require('moment-timezone');
const CheckOutStatsPipeline = require('../../../pipeline/checkOutStats/checkOutStatsPipeline');
const checkOutTeamMemberUow = require('../../../uow/teamMember/checkOutTeamMemberUow');
const StoreSettings = require('../../../models/storeSettings');

async function checkOut(req, res, next) {
    try {
        const { teamMemberId, previousStoreId, businessId } = req;
        const checkOutTimeStandard = new Date();
        const checkOutTime = checkOutTimeStandard.toISOString();
        const checkOutStatsPayload = {
            teamMemberId,
            checkOutTime,
            previousStoreId,
            businessId,
        };
        const CheckoutStats = {
            teamMemberName: '',
            shiftDate: '',
            checkInTime: '',
            checkOutTime: '',
            totalHoursWorked: '',
            totalOrdersProcessed: '',
            totalPoundsProcessed: '',
            cashTotal: '',
            cashTransactions: [],
            creditCardTotal: '',
            creditCardTransactions: [],
            cashCardTotal: '',
            cashCardTransactions: [],
            isEmployeeCodeRequired: '',
        };

        await checkOutTeamMemberUow({ teamMemberId, checkOutTime });

        const output = await CheckOutStatsPipeline(checkOutStatsPayload);
        const time = [output.hours.toFixed(0), output.minutes.toFixed(0)];
        const { checkedInTime, checkedOutTime } = output;
        const storeSetting = await StoreSettings.query().findOne('storeId', previousStoreId);
        const timeZone = storeSetting.timeZone || 'America/New_York';
        const shiftDate = moment.tz(checkedInTime, timeZone).format('MM/DD/YYYY');
        const checkedOutTimeString = `${moment.tz(checkedOutTime, timeZone).format('hh:mm A z')}`;
        const checkedInTimeString = `${moment.tz(checkedInTime, timeZone).format('hh:mm A z')}`;
        CheckoutStats.teamMemberName = output.fullname;
        CheckoutStats.shiftDate = shiftDate;
        CheckoutStats.checkInTime = checkedInTimeString;
        CheckoutStats.checkOutTime = checkedOutTimeString;
        CheckoutStats.totalHoursWorked = time;
        CheckoutStats.totalOrdersProcessed = output.totalProcessedOrdersForEmployee.length;
        CheckoutStats.totalPoundsProcessed = output.totalPoundsProcessed;
        CheckoutStats.cashTotal = `$${output.cashTotal}`;
        CheckoutStats.cashTransactions = output.cashOrderLineItems;
        CheckoutStats.creditCardTotal = `$${output.creditCardTotal}`;
        CheckoutStats.creditCardTransactions = output.creditCardOrderLineItems;
        CheckoutStats.cashCardTotal = `$${output.cashCardTotal}`;
        CheckoutStats.cashCardTransactions = output.cashCardOrderLineItems;
        res.status(200).json({
            success: true,
            data: CheckoutStats,
            isEmpCodeRequired: output.isEmployeeCodeRequired,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = checkOut;

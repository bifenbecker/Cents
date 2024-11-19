const Pipeline = require('../pipeline');

// Uows
const getCheckedOutEmployeeName = require('../../uow/checkOutStats/getCheckedOutEmployeeNameEventUow');
const getOrderWeights = require('../../uow/checkOutStats/getOrderWeightsTotalsEventUow');
const getSalesStats = require('../../uow/checkOutStats/getSalesStatsEventUow');
const getTotalHoursWorked = require('../../uow/checkOutStats/getTotalHoursWorkedEventUow');
const getTotalSalesValue = require('../../uow/checkOutStats/getTotalSalesValueEventUow');
const getTotalOrdersProcessed = require('../../uow/checkOutStats/getTotalOrdersProcessedEventsUow');

/**
 * Get All Statistics for Checked Out Employee
 *
 * @param {Object} payload
 * @returns {Object} output
 */
async function checkOutStatsPipeline(payload) {
    try {
        const checkoutStatsPipeline = new Pipeline([
            getCheckedOutEmployeeName,
            getTotalHoursWorked,
            getTotalOrdersProcessed,
            getSalesStats,
            getTotalSalesValue,
            getOrderWeights,
        ]);
        const output = await checkoutStatsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = checkOutStatsPipeline;

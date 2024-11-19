const Pipeline = require('../../pipeline');

// Uows
const getTeamMember = require('../../../uow/teamMember/getTeamMemberUow');
const findCashDrawerStartEvent = require('../../../uow/cashManagement/findCashDrawerStartEventUow');
const getListOfCashPayments = require('../../../uow/cashManagement/getListOfCashPaymentsUow');
const endCashDrawerEvent = require('../../../uow/cashManagement/endCashDrawerEventUow');

/**
 * End a CashDrawerEvent model
 *
 * The pipeline contains the following units of work:
 *
 * 1) Get the TeamMember model for the employee
 * 2) Get the CashDrawerEvemt model and add it to pipeline
 * 3) Get list of cash payments for the store based on CashDrawerEvent start date
 * 4) Perform ending calculations and update CashDrawerEvent
 *
 * @param {Object} payload
 */
async function endCashDrawerEventPipeline(payload) {
    try {
        const cashDrawerEventPipeline = new Pipeline([
            getTeamMember,
            findCashDrawerStartEvent,
            getListOfCashPayments,
            endCashDrawerEvent,
        ]);
        const output = await cashDrawerEventPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = endCashDrawerEventPipeline;

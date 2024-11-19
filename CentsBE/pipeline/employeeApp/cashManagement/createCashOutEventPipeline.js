const Pipeline = require('../../pipeline');

// Uows
const getTeamMember = require('../../../uow/teamMember/getTeamMemberUow');
const getLatestCashOutEvent = require('../../../uow/cashManagement/getLatestCashOutEventUow');
const getListOfCashPayments = require('../../../uow/cashManagement/getListOfCashPaymentsUow');
const createCashOutEvent = require('../../../uow/cashManagement/createCashOutEventUow');

/**
 * Create a CashOutEvent model
 *
 * The pipeline contains the following units of work:
 *
 * 1) Get the TeamMember model for the employee
 * 2) Retrieve the most recent cash out event
 * 3) Get list of cash payments for the store based on recent cash out event
 * 4) Create CashOutEvent model
 *
 * @param {Object} payload
 */
async function createCashOutEventPipeline(payload) {
    try {
        const cashOutEventPipeline = new Pipeline([
            getTeamMember,
            getLatestCashOutEvent,
            getListOfCashPayments,
            createCashOutEvent,
        ]);
        const output = await cashOutEventPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createCashOutEventPipeline;

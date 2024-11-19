const { dateFormat } = require('../../helpers/dateFormatHelper');
// models
const Turns = require('../../models/turns');

// utils
const getOrderCodePreix = require('../../utils/getOrderCodePrefix');

// constants
const { serviceTypes } = require('../../constants/constants');

const mappedTurnDetails = (turn) => {
    const timezone = turn.store.settings.timeZone || 'UTC';
    const response = {};
    response.id = turn.id;
    response.code = turn.turnCode;
    response.prefix = `${turn.machine.model.machineType.name.charAt(0)}T`;
    response.serviceType = turn.serviceType;
    response.createdAt = dateFormat(turn.createdAt, timezone);
    response.startedAt = dateFormat(turn.startedAt, timezone);
    response.completedAt = dateFormat(turn.completedAt, timezone);

    response.machine = {
        id: turn.machine.id,
        name: turn.machine.name,
        prefix: `${turn.machine.model.machineType.name.charAt(0)}`,
        pricePerTurnInCents: turn.machine.machinePricings[0].price,
        machineType: turn.machine.model.machineType,
    };
    response.store = turn.store;

    // technician and customer details
    if (turn.serviceType === serviceTypes.TECHNICAL_SERVICE) {
        response.technicianName = turn.technicianName;
    } else {
        response.customer = turn.storeCustomer;
    }

    if (turn.serviceType === serviceTypes.FULL_SERVICE) {
        response.order = {
            id: turn.serviceOrderTurn.serviceOrder.id,
            orderCode: turn.serviceOrderTurn.serviceOrder.orderCode,
            orderCodeWithPrefix: getOrderCodePreix(turn.serviceOrderTurn.serviceOrder),
            totalTurns: turn.turnLineItems.length,
        };
    }

    if (turn.serviceType === serviceTypes.SELF_SERVICE) {
        response.payments = { ...turn.machinePayments.details };
    }
    return response;
};

/**
 *
 *
 * @param {*} payload
 */
async function turnDetails(payload) {
    try {
        const { transaction, turnId } = payload;
        const turnDetails = await Turns.query(transaction)
            .withGraphFetched(
                '[machine.[model.[machineType],machinePricings(machinePricings)],store(store).[settings(settings)], storeCustomer(storeCustomer),turnLineItems,serviceOrderTurn.[serviceOrder],machinePayments(machinePayments)]',
            )
            .modifiers({
                store: (query) => {
                    query.select('id', 'address');
                },
                settings: (query) => {
                    query.select('timeZone');
                },
                storeCustomer: (query) => {
                    query.select('id', 'firstName', 'lastName');
                },
                machinePricings: (query) => {
                    query.first(); // for PO
                },
                machinePayments: (query) => {
                    query.select('id', 'details'); // sending details json only
                },
            })
            .findById(turnId);
        if (!turnDetails) {
            throw new Error('Invalid turn id.');
        }
        return mappedTurnDetails(turnDetails);
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = turnDetails;

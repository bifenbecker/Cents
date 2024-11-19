const Turn = require('../../../models/turns');
const {
    getMachinePricePerTurn,
    getMachineNamePrefix,
    getMachineType,
} = require('../../../utils/machines/machineUtil');
const { getTotalTurnTimeInMinutes } = require('../../../utils/machines/turnUtil');
const { formattedTime } = require('../../../utils/formattedTime');
const { convertCentsToDollars } = require('../../../utils/convertMoneyUnits');
const { TIMEZONES } = require('../../../constants/constants');

async function getTurnDetailsWithOrderUow(payload) {
    const {
        turnId,
        constants: { storeCustomer },
        transaction,
    } = payload;
    const turnDetails = await Turn.query(transaction)
        .findById(turnId)
        .withGraphJoined(
            '[machine.[model.[machineType], machinePricings], store.[settings], order, turnLineItems]',
        );

    if (!turnDetails) {
        throw new Error('Turn is not found');
    }

    const { machine, store, order, turnLineItems } = turnDetails;
    const totalOrderInCents = turnDetails.netOrderTotalInCents;
    const totalOrderInDollars = convertCentsToDollars(totalOrderInCents);
    const totalTurnTime = getTotalTurnTimeInMinutes(turnLineItems);
    const timeZone = store.settings?.timeZone || TIMEZONES.UTC;

    const formattedRes = {
        id: turnDetails.id,
        code: turnDetails.turnCode,
        status: turnDetails.status,
        serviceType: turnDetails.serviceType,
        createdAt: formattedTime(turnDetails.createdAt, timeZone),
        startedAt: formattedTime(turnDetails.startedAt, timeZone),
        completedAt: formattedTime(turnDetails.completedAt, timeZone),
        enabledAt: formattedTime(turnDetails.enabledAt, timeZone),
        netOrderTotalInCents: totalOrderInCents,
        totalTurnTime,
        machine: {
            id: machine.id,
            name: machine.name,
            prefix: getMachineNamePrefix(machine.model),
            pricePerTurnInCents: getMachinePricePerTurn(machine),
            type: getMachineType(machine.model),
        },
        store: {
            id: store.id,
            address: store.address,
        },
        business: {
            id: store.businessId,
        },
        storeCustomer: {
            id: storeCustomer.id,
            firstName: storeCustomer.firstName,
            lastName: storeCustomer.lastName,
            phoneNumber: storeCustomer.phoneNumber,
        },
        order: {
            id: order.id,
            orderableType: order.orderableType,
            subtotal: totalOrderInDollars,
            totalPaid: totalOrderInDollars, // will be updated with promotion feature
            promotion: {}, // will be added with promotion feature
        },
    };

    return formattedRes;
}

module.exports = {
    getTurnDetailsWithOrderUow,
};

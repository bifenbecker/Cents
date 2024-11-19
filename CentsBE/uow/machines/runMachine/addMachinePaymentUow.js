const { MACHINE_PAYMENT_TYPES, serviceTypes } = require('../../../constants/constants');
const MachinePayment = require('../../../models/machinePayment');
const MachinePaymentType = require('../../../models/machinePaymentType');

/**
 * For SelfService turn, storeCustomer is supposed to pay for the turn
 */
async function addMachinePaymentUow(payload) {
    const { turn, transaction, serviceType } = payload;
    if (serviceType !== serviceTypes.SELF_SERVICE) {
        return payload;
    }
    const machinePaymentType = await MachinePaymentType.query(transaction).findOne({
        type: MACHINE_PAYMENT_TYPES.APP,
    });
    if (!machinePaymentType) {
        throw new Error(`Machine payment type ${MACHINE_PAYMENT_TYPES.APP} does not exist`);
    }
    const machinePayment = await MachinePayment.query(transaction).insertAndFetch({
        paymentTypeId: machinePaymentType.id,
        turnId: turn.id,
    });

    return { ...payload, machinePayment };
}

module.exports = {
    addMachinePaymentUow,
};

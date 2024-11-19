const ServiceOrderWeightLog = require('../../../models/serviceOrderWeights');

async function createServiceOrderWeightLogs(payload) {
    const {
        transaction,
        employee,
        status,
        chargeableWeight = 0,
        totalWeight,
        serviceOrder,
    } = payload;
    const weightLogsPayload = {
        step: 1,
        chargeableWeight,
        totalWeight,
        status,
        teamMemberId: employee ? employee.id : null,
        serviceOrderId: serviceOrder.id,
    };
    await ServiceOrderWeightLog.query(transaction).insert(weightLogsPayload);
    return payload;
}
module.exports = exports = createServiceOrderWeightLogs;

const WeightLogsBuilder = require('../../../../services/orders/builders/weightLog/base');
const ServiceOrderWeightLog = require('../../../../models/serviceOrderWeights');

async function getFirstWeightLog(serviceOrderId, transaction) {
    const weightLog = await ServiceOrderWeightLog.query(transaction)
        .where('serviceOrderId', serviceOrderId)
        .orderBy('id')
        .limit(1)
        .first();
    return weightLog;
}

async function addWeightLog(payload) {
    const { employee, totalWeight, status, chargeableWeight, serviceOrderId, transaction } =
        payload;
    if (totalWeight) {
        const firstWeightLog = await getFirstWeightLog(serviceOrderId, transaction);
        const weightLogBuilder = new WeightLogsBuilder(
            firstWeightLog || {},
            {
                totalWeight,
                status,
                chargeableWeight,
                serviceOrderId,
            },
            employee,
        );
        const upsertObj = weightLogBuilder.build();
        await ServiceOrderWeightLog.query(transaction).upsertGraph(upsertObj);
    }
    return payload;
}

module.exports = exports = addWeightLog;

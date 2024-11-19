const ServiceOrderWeights = require('../../models/serviceOrderWeights');

async function getWeightStats(payload) {
    const newPayload = payload;
    const { totalProcessedOrdersForEmployee } = newPayload;
    try {
        const processedOrderIds = totalProcessedOrdersForEmployee.map((order) => order.orderableId);
        const processedOrderWeights = await ServiceOrderWeights.query()
            .where((builder) => builder.whereIn('serviceOrderId', processedOrderIds))
            .andWhere('status', 'PROCESSING');
        const processedWeightArray = processedOrderWeights.map((weight) => weight.totalWeight);
        let processedTotalWeight = processedWeightArray.reduce(
            (weight1, weight2) => weight1 + weight2,
            0,
        );
        processedTotalWeight = processedTotalWeight ? Number(processedTotalWeight).toFixed(2) : 0;
        newPayload.totalPoundsProcessed = processedTotalWeight;
        return newPayload;
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = exports = getWeightStats;

const WeightLog = require('../../models/weightLog');
const ServiceOrderWeights = require('../../models/serviceOrderWeights');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const getItem = async (a, trx) => {
    const serviceOrderWeight = await ServiceOrderWeights.query(trx)
        .where('referenceItemId', a.orderItem.referenceItems[0].id)
        .where('step', a.step)
        .where('teamMemberId', a.teamMemberId)
        .where('totalWeight', a.weight)
        .where('status', a.status);
    if (!serviceOrderWeight.length) {
        return {
            referenceItemId: a.orderItem.referenceItems[0].id,
            teamMemberId: a.teamMemberId,
            step: a.step,
            totalWeight: a.weight,
            chargeableWeight: a.weight,
            status: a.status,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
        };
    }
    return null;
};
const getList = async (weightLogs, trx) => {
    if (!weightLogs.length) {
        return [];
    }
    const que = [];
    for (let index = 0; index < weightLogs.length; index++) {
        const a = weightLogs[index];
        if (a.orderItem && a.orderItem.referenceItems && a.orderItem.referenceItems.length > 0) {
            que.push(getItem(a, trx));
        }
    }
    return Promise.all(que);
};
const migrateServiceOrderWeightsData = async (options) => {
    try {
        const weightLogs = await WeightLog.query(options.trx)
            .withGraphFetched(
                `[orderItem(orderItemDetails).
                       [
                        referenceItems(referenceItemsDetails)
                       ]
                     ]`,
            )
            .modifiers({
                orderItemDetails: (query) => {
                    query.select('id');
                },
                referenceItemsDetails: (query) => {
                    query.select('id');
                },
            })
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .orderBy(`${WeightLog.tableName}.id`, 'desc');
        let serviceOrderWeights = await getList(weightLogs, options.trx);
        serviceOrderWeights = serviceOrderWeights.filter((item) => item);
        if (serviceOrderWeights.length) {
            await ServiceOrderWeights.query(options.trx).insert(serviceOrderWeights);
        }
        if (weightLogs.length > 0) {
            return migrateServiceOrderWeightsData({
                ...options,
                noOfRowsProcessed: options.noOfRowsProcessed + weightLogs.length,
            });
        }
        return null;
    } catch (err) {
        LoggerHandler('error', err);
        return null;
    }
};

module.exports.migrateServiceOrderWeightsData = migrateServiceOrderWeightsData;

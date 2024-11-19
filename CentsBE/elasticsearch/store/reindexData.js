const { flatMap } = require('lodash');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const CustomQuery = require('../../services/customQuery');
const client = require('..');

async function reindexStoresData() {
    const customQueryObject = new CustomQuery('es-store-data.sql');
    const stores = await customQueryObject.execute();
    const mappedStores = stores.map((store) => {
        const { pin, ...rest } = store;
        if (pin.lat) {
            return {
                ...rest,
                pin,
            };
        }
        return rest;
    });
    const body = flatMap(mappedStores, (store) => [
        {
            index: {
                _index: `${process.env.ENV_NAME}_stores`,
                _id: Number(store.id),
            },
        },
        store,
    ]);
    const { body: bulkResponse } = await client.bulk({
        refresh: true,
        body,
    });
    if (bulkResponse.errors) {
        const erroredDocuments = [];
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
            const operation = Object.keys(action)[0];
            if (action[operation].error) {
                erroredDocuments.push({
                    // If the status is 429 it means that you can retry the document,
                    // otherwise it's very likely a mapping error, and you should
                    // fix the document before to try it again.
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: body[i * 2],
                    document: body[i * 2 + 1],
                });
            }
        });
        LoggerHandler('error', `error in reindexing stores ${JSON.stringify(erroredDocuments)}`, {
            stores,
        });
    }
}

(async () => {
    try {
        await reindexStoresData();
        process.exit(0);
    } catch (error) {
        LoggerHandler('error', 'error in reindexing stores data', error);
    }
})();

module.exports = {
    reindexStoresData,
};

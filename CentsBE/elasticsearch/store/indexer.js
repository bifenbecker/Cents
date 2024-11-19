const client = require('..');
const { getStoreIndexData } = require('./data');

async function addStore(storeId) {
    const { id, ...store } = await getStoreIndexData(storeId);
    const result = await client.index({
        index: `${process.env.ENV_NAME}_stores`,
        id,
        body: {
            id,
            ...store,
        },
        refresh: 'true',
    });
    return result;
}

module.exports = exports = {
    addStore,
};

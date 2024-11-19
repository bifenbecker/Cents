const { addStore } = require('../../elasticsearch/store/indexer');

async function indexStore(storeId) {
    await addStore(storeId);
}

module.exports = exports = indexStore;

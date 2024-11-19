const elasticsearch = require('.');

async function checkIndices(indice) {
    const isIndice = await elasticsearch.indices.exists({
        index: indice,
    });
    return isIndice;
}

module.exports = exports = checkIndices;

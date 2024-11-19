const elasticsearch = require('.');

async function deleteIndice(indexName) {
    const indice = await elasticsearch.indices.delete({
        index: indexName,
    });
    return indice;
}

module.exports = exports = deleteIndice;

const elasticsearch = require('.');

async function createIndice(indexName, body) {
    const indice = await elasticsearch.indices.create({
        index: indexName,
        body,
    });
    return indice;
}

module.exports = exports = createIndice;

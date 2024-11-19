const client = require('../../../elasticsearch/index');

class ElasticSearchProvider {
    constructor() {
        this.client = client;
    }

    async search() {
        const result = await this.client.search({
            index: this.indexName,
            body: this.body,
        });
        const {
            hits,
            total: { value },
        } = result.body.hits;
        return {
            data: hits.map((hit) => {
                const { _source } = hit;
                return _source;
            }),
            totalCount: value,
        };
    }
}

module.exports = exports = ElasticSearchProvider;

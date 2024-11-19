const ElasticSearchProvider = require('../elasticSearch/elasticSearchProvider');

class BaseSearchService {
    constructor() {
        this.provider = new ElasticSearchProvider();
    }
}

module.exports = exports = BaseSearchService;

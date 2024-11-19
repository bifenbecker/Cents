const ElasticSearchProvider = require('./elasticSearchProvider');

class CustomerSearchProvider extends ElasticSearchProvider {
    constructor(queryParams) {
        super();
        this.indexName = `${process.env.ENV_NAME}_business_customers`;
        this.queryParams = queryParams;
    }

    get searchKeyMappings() {
        return {
            phoneNumber: 'phoneNumber.analyzed',
            email: 'email.analyzed',
            name: 'fullName.analyzed',
        };
    }

    async storeCustomersList() {
        const { page = 1, limit = 10, storeIds, keyword } = this.queryParams;
        const queryObj = {
            bool: {
                filter: [
                    {
                        terms: {
                            storeIds,
                        },
                    },
                ],
            },
        };
        if (keyword) {
            queryObj.bool.should = [
                {
                    match_phrase_prefix: {
                        'fullName.analyzed': keyword,
                    },
                },
                {
                    match_phrase_prefix: {
                        'phoneNumber.analyzed': keyword,
                    },
                },
                {
                    match_phrase_prefix: {
                        'email.analyzed': keyword,
                    },
                },
            ];
            queryObj.bool.minimum_should_match = 1;
        }
        this.body = {
            from: (page - 1) * limit,
            size: limit,
            sort: {
                'fullName.raw': { order: 'asc' },
            },
            query: { ...queryObj },
        };
        const { data, totalCount } = await this.search();
        return {
            data,
            totalCount,
        };
    }

    async businessCustomersList() {
        const { page = 1, limit = 10, field, keyword, businessId } = this.queryParams;
        const queryObj = {
            bool: {
                must: [
                    {
                        term: {
                            businessId,
                        },
                    },
                ],
            },
        };
        if (field && keyword) {
            queryObj.bool.must.push({
                match_phrase_prefix: {
                    [this.searchKeyMappings[field]]: keyword,
                },
            });
        }
        this.body = {
            from: (page - 1) * limit,
            size: limit,
            sort: {
                'fullName.raw': { order: 'asc' },
            },
            query: { ...queryObj },
        };
        const { data, totalCount } = await this.search();
        return {
            data,
            totalCount,
        };
    }
}

module.exports = exports = CustomerSearchProvider;

const { flatMap } = require('lodash');
const client = require('..');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const logger = require('../../lib/logger');
const CustomQuery = require('../../services/customQuery');
const BusinessCustomers = require('../../models/businessCustomer');

const searchKeyMappings = {
    phoneNumber: 'phoneNumber.analyzed',
    email: 'email.analyzed',
    name: 'fullName.analyzed',
};

/**
 * 1. without keyword and field
 *      a. it should list only customers that are part of the business
 *          a.1. create business customers with multiple storeCustomers
 *          a.2. create multiple business customers with multiple storeCustomers
 * 2. with keyword and field
 *      a. it should list the data based on partial match of mentioned field
 * 3. sorting
 *      a. it should sort the list based on fullName asc order
 * 4. pagination
 *      a. pagination when queryparams are sent
 *          a.1. it should send data according to page and limit parameters
 *      b. pagination when queryparams are not sent
 *          b.1. it should send data according to page and limit default values
 *
 */
async function getBusinessCustomersList(queryParams) {
    const { page = 1, limit = 10, field, keyword, businessId } = queryParams;
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
                [searchKeyMappings[field]]: keyword,
            },
        });
    }

    const customers = await client.search({
        index: `${process.env.ENV_NAME}_business_customers`,
        body: {
            from: (page - 1) * limit,
            size: limit,
            sort: {
                'fullName.raw': { order: 'asc' },
            },
            query: { ...queryObj },
        },
    });
    const {
        hits,
        total: { value },
    } = customers.body.hits;
    return {
        data: hits.map((hit) => {
            const { _source } = hit;
            return _source;
        }),
        totalCount: value,
    };
}

/**
 * 1. without keyword
 *      a. it should list only customers that are part of the store
 *          a.1. create business customers with multiple storeCustomers
 *          a.2. create multiple business customers with multiple storeCustomers
 * 2. with keyword
 *      a. it should list the data based on partial match on one of fullName, phoneNumber or email
 * 3. sorting
 *      a. it should sort the list based on fullName asc order
 * 4. pagination
 *      a. pagination when queryparams are sent
 *          a.1. it should send data according to page and limit parameters
 *      b. pagination when queryparams are not sent
 *          b.1. it should send data according to page and limit default values
 *
 */
async function getStoreCustomersList(queryParams) {
    const { page = 1, limit = 10, currentStoreId, keyword } = queryParams;
    const queryObj = {
        bool: {
            must: [
                {
                    match: {
                        storeIds: currentStoreId,
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
    const customers = await client.search({
        index: `${process.env.ENV_NAME}_business_customers`,
        body: {
            from: (page - 1) * limit,
            size: limit,
            sort: {
                'fullName.raw': { order: 'asc' },
            },
            query: { ...queryObj },
        },
    });
    const {
        hits,
        total: { value },
    } = customers.body.hits;
    return {
        data: hits.map((hit) => {
            const { _source } = hit;
            return _source;
        }),
        totalCount: value,
    };
}

async function fetchAndReindexBusinessCustomers() {
    try {
        const { count } = await BusinessCustomers.query().count('id').first();
        const limit = 500;
        const noOfBatches = Math.ceil(Number(count) / limit);
        for (let i = 0; i < noOfBatches; i++) {
            const customQueryObject = new CustomQuery('es-businessCustomer-data.sql', {
                limit,
                offset: i * limit,
            });
            const businessCustomers = await customQueryObject.execute();
            if (businessCustomers.length) {
                const body = flatMap(businessCustomers, (businessCustomer) => [
                    {
                        index: {
                            _index: `${process.env.ENV_NAME}_business_customers`,
                            _id: Number(businessCustomer.id),
                            retry_on_conflict: 3,
                        },
                    },
                    businessCustomer,
                ]);
                const { body: bulkResponse } = await client.bulk({
                    refresh: true,
                    body,
                });
                if (bulkResponse.errors) {
                    // if there are errors while indexing the data
                    const erroredDocuments = [];
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
                    LoggerHandler(
                        'error',
                        `error in reindexing business customers - ${JSON.stringify(
                            erroredDocuments,
                        )}`,
                        { businessCustomers },
                    );
                }
            }
        }
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    getStoreCustomersList,
    getBusinessCustomersList,
    fetchAndReindexBusinessCustomers,
};

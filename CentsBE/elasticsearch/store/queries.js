const client = require('..');
const { returnTermQuery } = require('../helpers');

async function nearStores(businessId, zipCode, lat, lon) {
    const stores = await client.search({
        index: `${process.env.ENV_NAME}_stores`,
        body: {
            // size: 4, -> uncomment for adding limit.
            query: {
                bool: {
                    must: [
                        {
                            term: returnTermQuery('businessId', businessId),
                        },
                        {
                            term: returnTermQuery('deliveryEnabled', true),
                        },
                        {
                            bool: {
                                should: [
                                    {
                                        term: returnTermQuery('offersCentsDelivery', true),
                                    },
                                    {
                                        bool: {
                                            must: [
                                                { term: returnTermQuery('zipCodes', zipCode) },
                                                {
                                                    term: returnTermQuery(
                                                        'offersOwnDelivery',
                                                        true,
                                                    ),
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            sort: [
                {
                    _geo_distance: {
                        pin: {
                            lat,
                            lon,
                        },
                        unit: 'mi',
                        order: 'asc',
                    },
                },
            ],
        },
    });
    return stores.body.hits;
}

async function findOwnDeliveryStore(businessId, zipCode, lat, lon) {
    const stores = await client.search({
        index: `${process.env.ENV_NAME}_stores`,
        body: {
            size: 1,
            query: {
                bool: {
                    must: [
                        { term: returnTermQuery('businessId', businessId) },
                        { term: returnTermQuery('deliveryEnabled', true) },
                        { term: returnTermQuery('zipCodes', zipCode) },
                        { term: returnTermQuery('offersOwnDelivery', true) },
                        { exists: { field: 'googlePlacesId' } },
                    ],
                    must_not: [{ term: returnTermQuery('type', 'RESIDENTIAL') }],
                },
            },
            sort: [
                {
                    _geo_distance: {
                        pin: {
                            lat,
                            lon,
                        },
                        unit: 'mi',
                        order: 'asc',
                    },
                },
            ],
        },
    });
    return stores.body.hits.hits;
}

async function findOnDemandDeliveryStores(businessId, zipCode, lat, lon) {
    const stores = await client.search({
        index: `${process.env.ENV_NAME}_stores`,
        body: {
            size: 1,
            query: {
                bool: {
                    must: [
                        { term: returnTermQuery('businessId', businessId) },
                        { term: returnTermQuery('deliveryEnabled', true) },
                        { term: returnTermQuery('offersCentsDelivery', true) },
                        // { exists: { field: 'uberStoreUuid' } },
                        { exists: { field: 'googlePlacesId' } },
                    ],
                    must_not: [{ term: returnTermQuery('type', 'RESIDENTIAL') }],
                },
            },
            sort: [
                {
                    _geo_distance: {
                        pin: {
                            lat,
                            lon,
                        },
                        unit: 'mi',
                        order: 'asc',
                    },
                },
            ],
        },
    });
    return stores.body.hits.hits;
}

async function findStoreById(id) {
    const store = await client.get({
        index: `${process.env.ENV_NAME}_stores`,
        id,
    });
    const { _source: result } = store.body;
    return result;
}

async function validateUniqueBusinessZipCodes({ zipCodes, storeId, businessId }) {
    const stores = await client.search({
        index: `${process.env.ENV_NAME}_stores`,
        body: {
            size: 0,
            query: {
                bool: {
                    must_not: [{ term: returnTermQuery('id', storeId) }],
                    must: [
                        { term: returnTermQuery('businessId', businessId) },
                        { terms: { zipCodes } },
                    ],
                },
            },
        },
    });
    return stores.body.hits.total.value === 0;
}

module.exports = exports = {
    nearStores,
    findStoreById,
    findOwnDeliveryStore,
    findOnDemandDeliveryStores,
    validateUniqueBusinessZipCodes,
};

const Prices = require('../models/pricePerPound');
const ServiceCategories = require('../models/serviceCategories');
const Services = require('../models/services');
const ServicePrices = require('../models/servicePrices');
const ServiceReferenceItem = require('../models/serviceReferenceItem');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

function mapResponse(result) {
    const temp = {}; // to store key value object, key is combination of businessId category
    result.forEach((a) => {
        if (a.businessId) {
            if (temp[`${a.businessId}${a.laundryType.category}`]) {
            } else {
                /*
                 * setting default object for service category if key object is not there
                 */
                temp[`${a.businessId}${a.laundryType.category}`] = {
                    category: a.laundryType.category,
                    businessId: a.businessId,
                    imageUrl: null,
                    services: {},
                    deletedservices: {},
                };
            }

            if (a.isDeleted) {
                /*
                 * based on isDeleted column handling separatly .
                 * its service object construction for sepecfic cateogry
                 */
                if (
                    !temp[`${a.businessId}${a.laundryType.category}`].deletedservices[
                        a.laundryType.laundryType
                    ]
                ) {
                    temp[`${a.businessId}${a.laundryType.category}`].deletedservices[
                        a.laundryType.laundryType
                    ] = {
                        name: a.laundryType.laundryType,
                        description: a.laundryType.description,
                        defaultPrice: a.price,
                        deletedAt: a.updatedAt,
                        updatedAt: a.updatedAt,
                        createdAt: a.createdAt,
                        prices: [], // store prices objects
                    };
                }
                if (a.storeId) {
                    /*
                     * constructing prices objects based on storeId
                     */
                    temp[`${a.businessId}${a.laundryType.category}`].deletedservices[
                        a.laundryType.laundryType
                    ].prices.push({
                        storeId: a.storeId,
                        storePrice: a.price,
                        deletedAt: a.updatedAt,
                        updatedAt: a.updatedAt,
                        createdAt: a.createdAt,
                    });
                }
            } else {
                /*
                 * its service object construction for active cateogry list
                 */
                if (
                    !temp[`${a.businessId}${a.laundryType.category}`].services[
                        a.laundryType.laundryType
                    ]
                ) {
                    temp[`${a.businessId}${a.laundryType.category}`].services[
                        a.laundryType.laundryType
                    ] = {
                        name: a.laundryType.laundryType,
                        description: a.laundryType.description,
                        defaultPrice: a.price,
                        createdAt: a.createdAt,
                        updatedAt: a.updatedAt,
                        prices: [],
                    };
                }
                if (a.storeId) {
                    /*
                     * constructing prices objects based on storeId
                     */
                    temp[`${a.businessId}${a.laundryType.category}`].services[
                        a.laundryType.laundryType
                    ].prices.push({
                        storeId: a.storeId,
                        storePrice: a.price,
                        createdAt: a.createdAt,
                        updatedAt: a.updatedAt,
                    });
                }
            }
        }
    });
    const finalResult = Object.values(temp);
    finalResult.forEach((a) => {
        /*
         * combining both active and soft deleted objects into one for specifc category
         */
        a.services = [...Object.values(a.services), ...Object.values(a.deletedservices)];
        delete a.deletedservices;
    });
    return finalResult;
}
const getServicePrices = async () => {
    try {
        const services = await Prices.query()
            .select(
                'washServiceId',
                'price',
                'businessId',
                'storeId',
                'isDeleted',
                'updatedAt',
                'createdAt',
            )
            .eagerAlgorithm(Prices.JoinEagerAlgorithm)
            .eager('laundryType(reverse)', {
                reverse: (query) => {
                    query.select('id', 'laundryType', 'category', 'description');
                },
            }); // it will get all prices with washservice
        /*
         *its simple utitlity function map the result
         *in parent child array as per services schema
         */
        const result = mapResponse(services);
        return result;
    } catch (error) {
        LoggerHandler('error', error);
    }
};
const importData = async (result) => {
    /*
     * Inserting constructed bulk data with relations category->services->prices
     */
    try {
        const serviceCategories = await ServiceCategories.query().insertWithRelated(result);
        return serviceCategories;
    } catch (error) {
        LoggerHandler('error', error);
    }
};
const syncServicePricesObject = async (options) => {
    try {
        const services = await Prices.query()
            .select(`${Prices.tableName}.id`, 'washServiceId', 'price', 'businessId', 'storeId')
            .eagerAlgorithm(Prices.JoinEagerAlgorithm)
            .eager('laundryType(reverse)', {
                reverse: (query) => {
                    query.select('id', 'laundryType', 'category', 'description');
                },
            })
            .where('prices.isDeleted', options.isDeleted);
        const servicePriceIdObj = {};
        const serviceIdObj = {};
        /*
         * constructing service and service price objects with key value pair from existing prices table.
         * servicePrice Key is combination of businessId,category,laundryType and storeId for store prices
         * service key is combination of businessId,category,laundryType
         */
        services.forEach((a) => {
            if (a.businessId && a.storeId) {
                let key = `${a.businessId}${a.laundryType.category}${a.laundryType.laundryType}${a.storeId}`;
                if (!servicePriceIdObj[key]) {
                    servicePriceIdObj[key] = a.id;
                } else if (servicePriceIdObj[key] !== a.id) {
                    LoggerHandler(
                        'error',
                        'Something is not correct: servicePriceIdObj[key] !== a.id',
                    );
                }
            } else {
                let key = `${a.businessId}${a.laundryType.category}${a.laundryType.laundryType}`;

                if (!serviceIdObj[key]) {
                    serviceIdObj[key] = a.id;
                } else if (serviceIdObj[key] !== a.id) {
                    LoggerHandler('error', 'Something not correct in servicePriceObj');
                }
            }
        });

        let serviceCats = ServiceCategories.query()
            .eagerAlgorithm(ServiceCategories.JoinEagerAlgorithm)
            .eager('[services.[prices]]');
        if (!options.isDeleted) {
            serviceCats.where('services.deletedAt', null);
            // serviceCats.where("services:prices.deletedAt", null);
        } else {
            serviceCats.whereNotNull('services.deletedAt');
            // serviceCats.whereNotNull("services:prices.deletedAt");
        }
        serviceCats = await serviceCats;

        const newServiceIds = {},
            newServicePriceIds = {};
        /*
         * constructing service and service price objects with key value pair from
         * newly imported service catgory, servicesMaster and servicePrice table.
         * servicePrice Key is combination of businessId,category,service name and storeId for store prices
         * service key is combination of businessId,category,service name
         */
        serviceCats.forEach((cat) => {
            cat.services.forEach((service) => {
                service.prices.forEach((price) => {
                    if (price.storeId) {
                        const key = `${cat.businessId}${cat.category}${service.name}${price.storeId}`;
                        if (!newServicePriceIds[key]) {
                            newServicePriceIds[key] = price.id;
                        } else if (
                            newServicePriceIds[key] &&
                            newServicePriceIds[key] !== price.id
                        ) {
                            LoggerHandler(
                                'error',
                                'Something is not correct: newServicePriceIds[key] && newServicePriceIds[key] !== price.id',
                            );
                        }
                    }
                });
                const key = `${cat.businessId}${cat.category}${service.name}`;
                if (!newServiceIds[key]) {
                    newServiceIds[key] = service.id;
                } else if (newServiceIds[key] && newServiceIds[key] !== price.id) {
                    LoggerHandler(
                        'error',
                        'Something is not correct newServiceIds: newServiceIds[key] && newServiceIds[key] !== price.id',
                    );
                }
            });
        });
        /*
         * Looping servicePriceObj to update ServiceReferenceItem table servicePriceId
         * based on priceId column
         */

        for (let index = 0; index < Object.keys(servicePriceIdObj).length; index++) {
            const key = Object.keys(servicePriceIdObj)[index];
            await ServiceReferenceItem.query()
                .patch({
                    servicePriceId: newServicePriceIds[key],
                })
                .where('priceId', servicePriceIdObj[key]);
        }
        /*
         * Looping serviceIdObj to update ServiceReferenceItem table serviceId
         * based on priceId column
         */
        for (let index = 0; index < Object.keys(serviceIdObj).length; index++) {
            const key = Object.keys(serviceIdObj)[index];
            await ServiceReferenceItem.query()
                .patch({
                    serviceId: newServiceIds[key],
                })
                .where('priceId', serviceIdObj[key]);
        }
        return {
            servicePriceIdObj,
            serviceIdObj,
            newServiceIds,
            newServicePriceIds,
        };
    } catch (error) {
        LoggerHandler('error', error);
    }
};
/*
 * it util function to test data migration happened correclty or not
 * base on service price, name and category comparison with existing priceId
 */
const validateDataSync = async () => {
    const serviceReferenceItem = await ServiceReferenceItem.query()
        .eagerAlgorithm(ServiceReferenceItem.JoinEagerAlgorithm)
        .eager(
            '[priceItem.[laundryType],servicePrice.[service.[serviceCategory]],service.[serviceCategory]]',
        );
    serviceReferenceItem.forEach((a) => {
        if (a.servicePriceId) {
            if (a.servicePrice.storePrice != a.priceItem.price) {
                LoggerHandler('info', 'storePrice not matched.');
            }
            if (a.servicePrice.service.name != a.priceItem.laundryType.laundryType) {
                LoggerHandler('info', 'Service name not matched');
            }
        }
        if (a.serviceId) {
            if (a.service.defaultPrice != a.priceItem.price) {
                LoggerHandler('info', 'defaultPrice not matched');
            }
            if (a.service.name != a.priceItem.laundryType.laundryType) {
                LoggerHandler('info', 'Service name not matched');
            }
        }
    });
};

module.exports.getServicePrices = getServicePrices;
module.exports.importData = importData;
module.exports.syncServicePricesObject = syncServicePricesObject;
module.exports.validateDataSync = validateDataSync;

require('dotenv').config();
const createIndice = require('../createIndice');
const deleteIndice = require('../deleteIndice');
const checkIndice = require('../checkIndice');

const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function StoreSchema() {
    const indexName = `${process.env.ENV_NAME}_stores`;
    const schema = {
        mappings: {
            properties: {
                id: { type: 'integer' },
                businessId: { type: 'integer' },
                name: { type: 'keyword' },
                type: { type: 'keyword' },
                googlePlacesId: { type: 'keyword' },
                isArchived: { type: 'boolean' },
                zipCodes: { type: 'keyword' },
                deliveryEnabled: { type: 'boolean' },
                offersOwnDelivery: { type: 'boolean' },
                offersCentsDelivery: { type: 'boolean' },
                deliveryFeeInCents: { type: 'integer' },
                subsidyInCents: { type: 'integer' },
                returnOnlySubsidyInCents: { type: 'integer' },
                turnAroundInHours: { type: 'integer' },
                state: { type: 'keyword' },
                uberStoreUuid: { type: 'keyword' },
                pin: { type: 'geo_point' },
                recurringDiscountInPercent: { type: 'integer' },
                doorDashEnabled: { type: 'boolean' },
                returnDeliveryFeeInCents: { type: 'integer' },
                autoScheduleReturnEnabled: { type: 'boolean' },
                customLiveLinkHeader: { type: 'text' },
                customLiveLinkMessage: { type: 'text' },
            },
        },
    };
    await checkIndice(indexName)
        .then(async (index) => {
            if (index.statusCode === 200) {
                LoggerHandler('info', `${indexName} index already exists.`);
                LoggerHandler('info', `deleting ${indexName} index`);
                await deleteIndice(indexName);
                LoggerHandler('info', `deleted ${indexName} index`);
            }
            await createIndice(indexName, schema)
                .then(() => {
                    LoggerHandler('info', `${indexName} index created successfully!.`);
                })
                .catch((err) => {
                    LoggerHandler('error', err);
                });
        })
        .catch((err) => {
            LoggerHandler('error', err);
        });
}

module.exports = {
    StoreSchema,
};

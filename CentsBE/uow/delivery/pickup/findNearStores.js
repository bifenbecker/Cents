const {
    findOwnDeliveryStore,
    findOnDemandDeliveryStores,
} = require('../../../elasticsearch/store/queries');
const { getCents20Flag } = require('../../../utils/launchdarkly/launchDarklyUserUtils');
const { generateDeliveryDays } = require('../../../utils/liveLink/generateDeliveryDays');
const { getTurnAroundForCents20 } = require('../../../utils/liveLink/getTurnAroundForCents20');

function mapStore(esStore) {
    const { _source, sort } = esStore;
    return {
        ..._source,
        distance: sort[0],
    };
}

async function findNearStores(payload) {
    try {
        const { businessId, zipCode, lat, lng, apiVersion, timeZone } = payload;
        const ownDeliveryStore = (await findOwnDeliveryStore(businessId, zipCode, lat, lng))[0];
        const onDemandDeliveryStore = (
            await findOnDemandDeliveryStores(businessId, zipCode, lat, lng)
        )[0];
        if (!ownDeliveryStore && !onDemandDeliveryStore) {
            throw new Error('STORES_NOT_AVAILABLE');
        }
        const newPayload = payload;
        newPayload.ownDeliveryStore = ownDeliveryStore ? mapStore(ownDeliveryStore) : {};
        newPayload.onDemandDeliveryStore = onDemandDeliveryStore
            ? mapStore(onDemandDeliveryStore)
            : {};

        const cents20LdFlag = await getCents20Flag(apiVersion, businessId);
        if (cents20LdFlag) {
            if (newPayload.ownDeliveryStore?.id) {
                const turnArounds = await getTurnAroundForCents20(newPayload.ownDeliveryStore);
                newPayload.ownDeliveryStore = {
                    ...newPayload.ownDeliveryStore,
                    ...turnArounds,
                };
            }

            if (newPayload.onDemandDeliveryStore?.id) {
                const turnArounds = await getTurnAroundForCents20(newPayload.onDemandDeliveryStore);
                newPayload.onDemandDeliveryStore = {
                    ...newPayload.onDemandDeliveryStore,
                    ...turnArounds,
                };
            }
        }
        const deliveryDays = generateDeliveryDays({ timeZone, customerZipCode: zipCode });
        newPayload.deliveryDays = deliveryDays;

        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = findNearStores;

const StorageRacks = require('../../../models/storageRacks');

const defineStorageRacksData = async (newPayload) => {
    const { transaction, serviceOrder, storageRacks = [] } = newPayload;
    const storageRackItems = [];
    storageRacks.forEach((orderStorageRack) => {
        if (orderStorageRack.rackInfo && orderStorageRack.rackInfo.length > 0) {
            storageRackItems.push(orderStorageRack.rackInfo);
        }
    });
    const storageRackString = storageRackItems.join(', ');

    const serviceOrderStorageRacks = {
        rackInfo: `${storageRackString}`,
        serviceOrderId: serviceOrder.id,
    };

    await StorageRacks.query(transaction).insert(serviceOrderStorageRacks);
};

async function createStorageRacks(payload) {
    try {
        const newPayload = payload;
        const { storageRacks = [] } = newPayload;

        if (storageRacks.length) {
            await defineStorageRacksData(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStorageRacks;

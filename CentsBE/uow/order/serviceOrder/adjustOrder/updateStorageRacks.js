const StorageRacks = require('../../../../models/storageRacks');

const handleUpdateStorageRacks = async (newPayload) => {
    const { transaction, id, storageRacks = [] } = newPayload;
    const storageRackItems = [];

    storageRacks.forEach((rack) => {
        storageRackItems.push(rack.rackInfo);
    });

    const finalString = storageRackItems.join(', ');

    const storageRackIdFound = storageRacks.find((orderStorageRack) => orderStorageRack.id);

    if (storageRackIdFound?.id) {
        await StorageRacks.query(transaction).findById(storageRackIdFound.id).patch({
            rackInfo: finalString,
        });
    }

    if (!storageRackIdFound?.id && id) {
        await StorageRacks.query(transaction).insert({
            rackInfo: finalString,
            serviceOrderId: id,
        });
    }
};
/**
 * update the storageRacks
 * @param {Object} payload
 */
async function updateStorageRacks(payload) {
    try {
        const newPayload = payload;

        await handleUpdateStorageRacks(newPayload);
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = updateStorageRacks;

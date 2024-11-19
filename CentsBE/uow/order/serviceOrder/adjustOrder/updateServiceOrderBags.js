const ServiceOrderBags = require('../../../../models/serviceOrderBags');
const createNoteString = require('../../../../utils/createNoteString');

const handleUpdateServiceOrderBags = async (newPayload) => {
    const { transaction, id, serviceOrderBags } = newPayload;

    const deletedBags = [];
    const bagsToUpdate = [];
    const bagsToAdd = [];
    serviceOrderBags.forEach((bag) => {
        if (bag.isDeleted) {
            deletedBags.push(bag);
        }
        if (!bag.isDeleted && bag.id) {
            bagsToUpdate.push(bag);
        }
        if (!bag.isDeleted && !bag.id) {
            bagsToAdd.push(bag);
        }
    });
    // update bags with deletedAt date
    if (deletedBags.length > 0) {
        deletedBags.forEach(async (bag) => {
            await ServiceOrderBags.query(transaction).findById(bag.id).patch({
                deletedAt: new Date(),
            });
        });
    }

    if (bagsToUpdate.length > 0) {
        bagsToUpdate.forEach(async (bag) => {
            const notesString = createNoteString(bag);

            await ServiceOrderBags.query(transaction)
                .findById(bag.id)
                .patch({
                    notes: `${notesString}`,
                    manualNoteAdded: (bag?.manualNote && bag?.manualNote.length > 0) || false,
                });
        });
    }

    if (bagsToAdd.length > 0) {
        const finalServiceOrderBags = [];
        bagsToAdd.forEach((bag) => {
            const notesString = createNoteString(bag);

            finalServiceOrderBags.push({
                barcode: null,
                barcodeStatus: null,
                isActiveBarcode: false,
                description: bag.description || null,
                notes: `${notesString}`,
                serviceOrderId: id,
                manualNoteAdded: (bag?.manualNote && bag?.manualNote.length > 0) || false,
            });
        });

        if (finalServiceOrderBags.length > 0) {
            await ServiceOrderBags.query(transaction).insert(finalServiceOrderBags);
        }
    }

    return ServiceOrderBags.query().where('serviceOrderId', id);
};
/**
 * update the serviceOrderBags
 * @param {Object} payload
 */
async function updateServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { serviceOrderBags = [] } = newPayload;
        if (serviceOrderBags.length) {
            await handleUpdateServiceOrderBags(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = updateServiceOrderBags;

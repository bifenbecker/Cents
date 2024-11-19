const HangerBundles = require('../../../../models/hangerBundles');
const createNoteString = require('../../../../utils/createNoteString');

const handleUpdateHangerBundles = async (newPayload) => {
    const { transaction, id, hangerBundles } = newPayload;

    const deletedBundles = [];
    const hangerBundlesToUpdate = [];
    const hangerBundlesToAdd = [];
    hangerBundles.forEach((hangerBundle) => {
        if (hangerBundle.isDeleted) {
            deletedBundles.push(hangerBundle);
        }
        if (!hangerBundle.isDeleted && hangerBundle.id) {
            hangerBundlesToUpdate.push(hangerBundle);
        }
        if (!hangerBundle.isDeleted && !hangerBundle.id) {
            hangerBundlesToAdd.push(hangerBundle);
        }
    });
    // update hangerBundles with deletedAt date
    if (deletedBundles.length > 0) {
        deletedBundles.forEach(async (hangerBundle) => {
            await HangerBundles.query(transaction).findById(hangerBundle.id).patch({
                deletedAt: new Date().toISOString(),
            });
        });
    }

    if (hangerBundlesToUpdate.length > 0) {
        hangerBundlesToUpdate.forEach(async (hangerBundle) => {
            const notesString = createNoteString(hangerBundle);

            await HangerBundles.query(transaction)
                .findById(hangerBundle.id)
                .patch({
                    notes: `${notesString}`,
                    manualNoteAdded:
                        (hangerBundle.manualNote && hangerBundle.manualNote.length > 0) || false,
                });
        });
    }

    if (hangerBundlesToAdd.length > 0) {
        const finalHangerBundles = [];
        hangerBundlesToAdd.forEach((hangerBundle) => {
            const notesString = createNoteString(hangerBundle);

            finalHangerBundles.push({
                notes: `${notesString}`,
                serviceOrderId: id,
                manualNoteAdded:
                    (hangerBundle?.manualNote && hangerBundle?.manualNote.length > 0) || false,
            });
        });

        await HangerBundles.query(transaction).insert(finalHangerBundles);
    }

    return HangerBundles.query().where('serviceOrderId', id);
};
/**
 * update the hangerBundles
 * @param {Object} payload
 */
async function updateHangerBundles(payload) {
    try {
        const newPayload = payload;
        const { hangerBundles = [] } = newPayload;
        if (hangerBundles.length) {
            await handleUpdateHangerBundles(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = updateHangerBundles;

const HangerBundles = require('../../../models/hangerBundles');

const defineHangerBundlesData = async (newPayload) => {
    const { transaction, serviceOrder, hangerBundles = [] } = newPayload;
    const serviceOrderHangerBundles = hangerBundles.map((orderHangerBundle) => {
        let notesString = '';
        orderHangerBundle.notes.forEach((notes, index) => {
            notesString = `${notesString + notes.name}${
                index === orderHangerBundle.notes.length - 1 ? '' : ', '
            }`;
        });
        if (orderHangerBundle.manualNote) {
            notesString = `${`${notesString}, ${orderHangerBundle.manualNote}`}`;
        }

        return {
            notes: `${notesString}`,
            serviceOrderId: serviceOrder.id,
            manualNoteAdded:
                (orderHangerBundle.manualNote && orderHangerBundle.manualNote.length > 0) || false,
        };
    });
    await HangerBundles.query(transaction).insert(serviceOrderHangerBundles);
};

async function createHangerBundles(payload) {
    try {
        const newPayload = payload;
        const { hangerBundles = [] } = newPayload;

        if (hangerBundles.length) {
            await defineHangerBundlesData(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createHangerBundles;

const ServiceOrderBags = require('../../../models/serviceOrderBags');

const defineServiceOrderBagsData = async (newPayload) => {
    const {
        transaction,
        serviceOrder,
        bags = [],
        serviceOrderBags = [],
        status,
        version,
        cents20LdFlag,
    } = newPayload;
    let finalServiceOrderBags;
    if (version >= '2.0.0' && cents20LdFlag) {
        finalServiceOrderBags = serviceOrderBags.map((orderBag) => {
            let notesString = '';
            orderBag.notes.forEach((notes, index) => {
                notesString = `${notesString + notes.name}${
                    index === orderBag.notes.length - 1 ? '' : ', '
                }`;
            });
            if (orderBag.manualNote) {
                notesString = `${`${notesString}, ${orderBag.manualNote}`}`;
            }

            return {
                barcode: orderBag.barcode,
                barcodeStatus: status,
                isActiveBarcode: true,
                description: orderBag.description || null,
                notes: `${notesString}`,
                serviceOrderId: serviceOrder.id,
                manualNoteAdded: (orderBag.manualNote && orderBag.manualNote.length > 0) || false,
            };
        });
    } else {
        finalServiceOrderBags = bags.map((orderBag) => ({
            barcode: orderBag.barcode,
            barcodeStatus: status,
            isActiveBarcode: true,
            description: orderBag.description || null,
            notes: orderBag.notes || null,
            serviceOrderId: serviceOrder.id,
        }));
    }
    await ServiceOrderBags.query(transaction).insert(finalServiceOrderBags);
};
/**
 * update the serviceOrderBag status to the serviceOrderStatus
 * @param {Object} payload
 */
async function createServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { bags = [], serviceOrderBags = [] } = newPayload;

        if (bags.length || serviceOrderBags.length) {
            await defineServiceOrderBagsData(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createServiceOrderBags;

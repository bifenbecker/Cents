const ServiceOrderBags = require('../../models/serviceOrderBags');

async function createServiceOrderBags(payload) {
    try {
        const newPayload = { ...payload };
        const { serviceOrder, bags, transaction } = payload;

        const bagsPayload = bags.map((bag) => {
            const updatedBag = { ...bag };
            updatedBag.serviceOrderId = serviceOrder.id;
            updatedBag.barcodeStatus = 'DESIGNATED_FOR_PROCESSING_AT_HUB';
            updatedBag.isActiveBarcode = true;
            return updatedBag;
        });

        const serviceOrderBags = await ServiceOrderBags.query(transaction)
            .insert(bagsPayload)
            .returning('*');

        newPayload.serviceOrderBags = serviceOrderBags;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = createServiceOrderBags;

const Machine = require('../../../models/machine');

async function getBusinessThemeByMachineBarcodeUow(payload) {
    const { barcode, transaction } = payload;
    const machine = await Machine.query(transaction)
        .findOne({
            serialNumber: barcode,
        })
        .withGraphJoined('[store.[laundromatBusiness.[businessTheme]]]');

    if (!machine) {
        throw new Error('Machine is not found');
    }
    const { store } = machine;

    if (!store.laundromatBusiness?.businessTheme) {
        throw new Error('Business theme is not found');
    }

    const { businessTheme, name: businessName } = store.laundromatBusiness;

    return {
        ...businessTheme,
        businessName,
    };
}

module.exports = {
    getBusinessThemeByMachineBarcodeUow,
};

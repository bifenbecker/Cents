const TaxRate = require('../../models/taxRate');

async function getTaxRateStatus(payload) {
    try {
        const {
            currentStore: { taxRateId },
            transaction,
        } = payload;

        const taxData = await TaxRate.query(transaction)
            .findById(taxRateId)
            .select('taxRates.id', 'taxRates.rate', 'taxRates.taxAgency', 'taxRates.name');

        return taxData;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getTaxRateStatus;

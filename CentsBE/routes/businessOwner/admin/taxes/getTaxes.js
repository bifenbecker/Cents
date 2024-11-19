const TaxRate = require('../../../../models/taxRate');
const getBusiness = require('../../../../utils/getBusiness');

async function getTaxes(req, res, next) {
    try {
        const business = await getBusiness(req);
        const taxes = await TaxRate.query()
            .where('businessId', business.id)
            .select('id', 'name', 'rate', 'taxAgency', 'businessId');

        res.json({
            success: true,
            taxes,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getTaxes;

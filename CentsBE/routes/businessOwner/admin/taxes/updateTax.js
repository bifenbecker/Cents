const TaxRate = require('../../../../models/taxRate');
const getBusiness = require('../../../../utils/getBusiness');

async function updateTax(req, res, next) {
    try {
        const { taxAgency, rate, name } = req.body;
        const { id } = req.params;
        const business = await getBusiness(req);

        const tax = await TaxRate.query()
            .update({
                taxAgency,
                rate,
                name,
            })
            .where('businessId', business.id)
            .where('id', id)
            .returning('id', 'name', 'rate', 'taxAgency', 'businessId');

        res.json({
            success: true,
            tax,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateTax;

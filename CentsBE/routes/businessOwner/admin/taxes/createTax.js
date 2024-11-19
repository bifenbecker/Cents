const TaxRate = require('../../../../models/taxRate');
const getBusiness = require('../../../../utils/getBusiness');

async function createTax(req, res, next) {
    try {
        const { taxAgency, rate, name } = req.body;
        const business = await getBusiness(req);

        const tax = await TaxRate.query()
            .insert({
                businessId: business.id,
                taxAgency,
                rate,
                name,
            })
            .returning('id', 'name', 'rate', 'taxAgency', 'businessId');

        res.status(201).json({
            success: true,
            tax,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createTax;

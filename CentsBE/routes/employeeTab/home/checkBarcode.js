const ServiceOrderBags = require('../../../models/serviceOrderBags');

async function checkBarcode(req, res, next) {
    try {
        const { barcode } = req.query;
        if (barcode == null) throw new Error('BARCODE_REQUIRED');
        const bags = await ServiceOrderBags.query().where({ barcode, isActiveBarcode: true });

        if (bags.length) throw new Error('BARCODE_NOT_AVAILABLE');
        res.status(200).json({
            status: 'success',
            message: 'Barcode is available',
        });
    } catch (error) {
        if (error.message === 'BARCODE_NOT_AVAILABLE') {
            res.status(404).json({
                error: true,
                message: 'Barcode is not available',
            });
        } else if (error.message === 'BARCODE_REQUIRED') {
            res.status(422).json({
                error: true,
                message: 'barcode param is required',
            });
        } else {
            next(error);
        }
    }
}

module.exports = exports = checkBarcode;

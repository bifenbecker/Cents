const getBusiness = require('../../../../utils/getBusiness');
const validateZipCode = require('../../../../utils/validateZipcode');

async function validateZipcode(req, res, next) {
    try {
        const { zipcode, storeId } = req.body;
        const business = await getBusiness(req);

        await validateZipCode([zipcode], business, storeId);

        res.status(200).json({
            success: true,
            message: 'Zip code is valid',
        });
    } catch (error) {
        if (error.message === 'invalid_zipcode') {
            res.status(404).json({
                error: 'Please enter a valid zip code',
            });
        }
        if (error.message === 'zipcode_exists') {
            res.status(409).json({
                error: 'Zip code exists for other store(s)',
            });
        } else {
            next(error);
        }
    }
}

module.exports = validateZipcode;

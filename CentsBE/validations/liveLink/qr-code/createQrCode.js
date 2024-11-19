const validateQrCodeHash = require('../../validateQrCodeHash');

const createQrCodeValidation = async (req, res, next) => {
    try {
        const { qrCodeHash } = req.body;
        if (!qrCodeHash) {
            return res.status(400).json({ message: 'qrCodeHash is required' });
        }

        const qrCodeHashValidationResult = validateQrCodeHash(qrCodeHash);
        if (qrCodeHashValidationResult.error) {
            return res.status(400).json({ message: 'qrCodeHash is not valid' });
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

module.exports = createQrCodeValidation;

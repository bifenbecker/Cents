async function getResidentialScanditKey(req, res, next) {
    try {
        const token = process.env.RESIDENTAIL_APP_SCANDIT_KEY;
        return res.status(200).json({
            token,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = getResidentialScanditKey;

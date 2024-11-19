async function getScanditKey(req, res, next) {
    try {
        const token = process.env.SCANDIT_KEY;
        return res.status(200).json({
            token,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = getScanditKey;

async function getFileStackKey(req, res, next) {
    try {
        const fileStackApi = process.env.FILE_STACK_KEY;
        return res.status(200).json({
            fileStackApi,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = getFileStackKey;

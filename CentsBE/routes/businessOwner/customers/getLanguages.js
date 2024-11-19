const Language = require('../../../models/language');

async function getLanguages(req, res, next) {
    try {
        const languages = await Language.query().select('id', 'language');
        res.status(200).json({
            success: true,
            languages,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLanguages;

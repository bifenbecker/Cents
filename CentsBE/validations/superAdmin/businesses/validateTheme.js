const Joi = require('@hapi/joi');
const BusinessTheme = require('../../../models/businessTheme');
const StoreTheme = require('../../../models/storeTheme');
const { incrementalIdDecrypt } = require('../../../utils/encoders/incrementalIdEncode');
const { formatToKebabCase } = require('../../../utils/formatters/formatToKebabCase');
const { THEME_ERRORS } = require('../../../constants/error.messages');

function typeValidations(inputObj) {
    const schema = Joi.object()
        .keys({
            customUrl: Joi.string()
                .regex(/^[a-zA-Z0-9 -]*$/)
                .error(new Error(THEME_ERRORS.customUrlFormat))
                .allow('')
                .min(2)
                .max(40)
                .optional(),
            primaryColor: Joi.string()
                .regex(/^#[A-Fa-f0-9]{6}/)
                .error(new Error(THEME_ERRORS.hexColor))
                .optional(),
            borderRadius: Joi.string()
                .regex(/^[0-9]{1,3}px/)
                .error(new Error(THEME_ERRORS.radiusFormat))
                .optional(),
            logoUrl: Joi.string().max(300).optional(),
            name: Joi.string()
                .min(3)
                .max(50)
                .error(new Error(THEME_ERRORS.customNameLength))
                .optional(),
            storeId: Joi.number().optional(),
            initialTheme: Joi.object().optional(),
        })
        .optional();
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function themeValidator(req, res, next) {
    try {
        const {
            body: themeProperties,
            body: { customUrl },
        } = req;
        const isValid = typeValidations(themeProperties);

        if (isValid.error) {
            res.status(400).json({
                error: isValid.error.message,
            });
            return;
        }

        if (customUrl) {
            const possibleEncryptedId = incrementalIdDecrypt(customUrl);
            if (
                customUrl &&
                possibleEncryptedId > 0 &&
                possibleEncryptedId < (process.env.INCREMENTAL_THEMES_ID_COUNT || 10000)
            ) {
                res.status(400).json({
                    error: THEME_ERRORS.invalidCustomUtl,
                });
                return;
            }

            const formattedCustomUrl = formatToKebabCase(customUrl);
            const isBusinessThemeUpdate = req?.body?.initialTheme;
            let isNotUniqUrl;
            if (isBusinessThemeUpdate) {
                isNotUniqUrl = await BusinessTheme.query()
                    .where({
                        customUrl: formattedCustomUrl,
                    })
                    .first();
            } else {
                isNotUniqUrl = await StoreTheme.query()
                    .where({
                        customUrl: formattedCustomUrl,
                    })
                    .first();
            }

            if (isNotUniqUrl) {
                res.status(400).json({
                    error: THEME_ERRORS.customUrlIsNotUniq,
                });
                return;
            }
        }
        if (Number(customUrl)) {
            res.status(400).json({
                error: THEME_ERRORS.numericalCustomUrl,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = themeValidator;

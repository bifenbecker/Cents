const { transaction } = require('objection');

const User = require('../../../../models/user');
const LaundromatBusiness = require('../../../../models/laundromatBusiness');

const { validateAccountByField } = require('../../../../validations/createAccount');
const phoneNumberValidation = require('../../../../validations/signUpValidations/phoneNumber');

const deleteRegions = require('../../../../utils/updateRegionsAndDistricts');
const getBusiness = require('../../../../utils/getBusiness');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}

const updateAccountByField = async (req, res, next) => {
    let trx = null;
    let errMsg;
    try {
        const USER_MODEL_FIELDS = ['fullName', 'email', 'phone'];
        const BUSINESS_MODEL_FIELDS = [
            'address',
            'state',
            'city',
            'zipCode',
            'companyName',
            'needsRegions',
        ];

        // Parse the req
        const data = req.body;
        // Validate the data
        const error = validateAccountByField(data);
        if (error) {
            LoggerHandler('error', error.message, req);
            return res.status(422).json({
                error: error.message,
            });
        }
        // Update the db
        // const user = req.currentUser;
        const business = await getBusiness(req);

        if (USER_MODEL_FIELDS.includes(data.field)) {
            // update user table

            let patchObj = {
                [data.field]: data.value,
            };

            if (data.field === 'fullName') {
                // Handling for fullname
                const { firstName, lastName } = splitFullName(data.value);
                patchObj = {
                    firstname: firstName,
                    lastname: lastName,
                };
            }
            if (data.field === 'phone') {
                const isPhoneNumberInvalid = await phoneNumberValidation(
                    data.value,
                    business.userId,
                );
                if (isPhoneNumberInvalid) {
                    errMsg = 'Phone number already exists. Please enter a valid phone number.';
                    LoggerHandler('error', errMsg, req);
                    return res.status(422).json({
                        error: errMsg,
                    });
                }
            }
            await User.query()
                .patch({
                    ...patchObj,
                    isGlobalVerified: true,
                })
                .findById(business.userId);

            return res.json({ success: true });
        }

        if (BUSINESS_MODEL_FIELDS.includes(data.field)) {
            // update business table

            let dbFieldName = data.field;
            if (data.field === 'companyName') {
                dbFieldName = 'name';
            }
            if (data.field === 'needsRegions') {
                trx = await transaction.start(User.knex());
                if (data.value === false) {
                    /* Check if regions can be deleted or not. */
                    const { regionsThatCantBeDeleted, districtsThatCantBeDeleted } =
                        await deleteRegions(business, trx);
                    if (regionsThatCantBeDeleted.length || districtsThatCantBeDeleted.length) {
                        await trx.commit();
                        errMsg = 'Following regions and districts can not be deleted.';
                        LoggerHandler('error', errMsg, req);
                        return res.status(422).json({
                            error: errMsg,
                            Regions: regionsThatCantBeDeleted,
                            Districts: districtsThatCantBeDeleted,
                        });
                    }
                }
                await LaundromatBusiness.query(trx)
                    .patch({
                        [dbFieldName]: data.value,
                    })
                    .where('id', business.id);

                // update globalVerified flag so that
                // every time user is not redirected to account settings page on login.

                await User.query(trx)
                    .patch({
                        isGlobalVerified: true,
                    })
                    .findById(business.userId);
                await trx.commit();
                return res.json({ success: true });
            }
            trx = await transaction.start(User.knex());
            await LaundromatBusiness.query(trx)
                .patch({
                    [dbFieldName]: data.value,
                })
                .where('userId', business.userId)
                .first();

            // update globalVerified flag so that
            // every time user is not redirected to account settings page.

            await User.query(trx)
                .patch({
                    isGlobalVerified: true,
                })
                .findById(business.userId);
            await trx.commit();

            return res.json({ success: true });
        }
        // Invalid field name - as it is not present in both the arrays
        // Very unlikely to happen as the field validation will take care of it
        errMsg = 'Invalid field';
        LoggerHandler('error', errMsg, req);
        return res.status(422).json({ error: errMsg });
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        // Leaving this to global handler
        return next(e);
    }
};

module.exports = updateAccountByField;

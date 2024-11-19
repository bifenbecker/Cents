const { transaction } = require('objection');
const getBankAccountPaymentSettings = require('../../stripe/account/getPaymentSettings');

// Models
const Business = require('../../../models/laundromatBusiness');
const BusinessSettings = require('../../../models/businessSettings');
const Store = require('../../../models/store');

// Pipelines
const createNewBusinessPipeline = require('../../../pipeline/superAdmin/businesses/createNewBusinessPipeline');

// Validations
const { validateParamsIdType } = require('../../../validations/paramsValidation');
const { incrementalIdEncrypt } = require('../../../utils/encoders/incrementalIdEncode');

// Utils
const { ERROR_MESSAGES } = require('../../../constants/error.messages');

/**
 * Format each business with appropriate details for front-end
 *
 * @param {Object} business
 */
async function mapBusinessData(business) {
    const mappedData = {};

    mappedData.id = business.id;
    mappedData.name = business.name;
    mappedData.businessOwnerName = `${business.user.firstname} ${business.user.lastname}`;
    mappedData.businessOwnerEmail = business.user.email;
    mappedData.address = business.address;
    mappedData.city = business.city;
    mappedData.state = business.state;
    mappedData.zipCode = business.zipCode;
    mappedData.merchantId = business.merchantId;
    mappedData.stripeCustomerToken = business.stripeCustomerToken;
    mappedData.createdAt = business.createdAt;
    mappedData.userId = business.user.id;

    return mappedData;
}

async function mapBusinessSimpleData(business) {
    const mappedData = {};

    mappedData.value = business.id;
    mappedData.name = business.name;
    mappedData.display = business.name;

    return mappedData;
}

/**
 * Get all Businesses in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllBusinesses(req, res, next) {
    try {
        const businesses = await Business.query()
            .withGraphFetched(
                `[
                user,
            ]`,
            )
            .orderBy('createdAt', 'desc');

        let mappedBusinesses = businesses.map((item) => mapBusinessData(item));
        mappedBusinesses = await Promise.all(mappedBusinesses);

        return res.json({
            success: true,
            businesses: mappedBusinesses,
            total: mappedBusinesses.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get business with stripe account payment statement descriptor
 * @param {Object} business
 * @return {Object}
 */
async function getBusinessWithPaymentStatementDescriptor(business) {
    const { merchantId } = business;

    if (!merchantId) {
        return business;
    }

    const statementDescriptor = (await getBankAccountPaymentSettings(merchantId))
        ?.statement_descriptor;

    return {
        ...business,
        statementDescriptor,
    };
}

/**
 * Update a single item within the Business model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateFieldValueForBusiness(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(Business.knex());
        const business = await Business.query(trx)
            .withGraphFetched(
                `[
                user,
            ]`,
            )
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        return res.json({
            success: true,
            business: await getBusinessWithPaymentStatementDescriptor(business),
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }

        return next(error);
    }
}

/**
 * Create a new business in the Cents system
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createNewBusiness(req, res, next) {
    try {
        const output = await createNewBusinessPipeline(req.body);

        return res.json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get all stores for a given business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllStoresPerBusiness(req, res, next) {
    try {
        const { id } = req.params;
        const allStores = await Store.query().withGraphFetched('storeTheme').where({
            businessId: id,
        });
        const storesWithEncodedLink = allStores.map((store) => ({
            ...store,
            storeTheme: {
                ...store.storeTheme,
                encodedLink: incrementalIdEncrypt(store.storeTheme?.id),
                name: store.name,
            },
        }));
        return res.json({
            success: true,
            stores: storesWithEncodedLink,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Search across our LaundromatBusiness models based on search input
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function searchBusinesses(req, res, next) {
    try {
        const { searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const businesses = await Business.query()
            .withGraphFetched(
                `[
                user,
            ]`,
            )
            .select('laundromatBusiness.*')
            .join('users', 'users.id', 'laundromatBusiness.userId')
            .where('laundromatBusiness.name', 'ilike', `%${searchTerm}%`)
            .orWhere('users.firstname', 'ilike', `%${searchTerm}%`)
            .orWhere('users.lastname', 'ilike', `%${searchTerm}%`)
            .orWhere('users.email', 'ilike', `%${searchTerm}%`)
            .orWhere('laundromatBusiness.address', 'ilike', `%${searchTerm}%`)
            .orWhere('laundromatBusiness.city', 'ilike', `%${searchTerm}%`)
            .orWhere('laundromatBusiness.state', 'ilike', `%${searchTerm}%`)
            .orWhere('laundromatBusiness.zipCode', 'ilike', `%${searchTerm}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder.orWhere('laundromatBusiness.id', '=', `${searchTerm}`);
                }
            });

        let mappedBusinesses = businesses.map((item) => mapBusinessData(item));
        mappedBusinesses = await Promise.all(mappedBusinesses);

        return res.json({
            success: true,
            businesses: mappedBusinesses,
            total: mappedBusinesses.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get all Businesses' names and ids in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllBusinessesSimple(req, res, next) {
    try {
        const businesses = await Business.query().orderBy('name', 'asc');

        let mappedBusinesses = businesses.map((item) => mapBusinessSimpleData(item));
        mappedBusinesses = await Promise.all(mappedBusinesses);

        return res.json({
            success: true,
            businesses: mappedBusinesses,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update the value of a given attribute on the BusinessSetting model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateBusinessSettings(req, res, next) {
    let trx = null;

    try {
        const { field, value, id } = req.body;
        trx = await transaction.start(BusinessSettings.knex());
        await BusinessSettings.query(trx)
            .patch({
                [field]: value,
            })
            .findOne({ businessId: id })
            .returning('*');
        await trx.commit();

        const business = await Business.query()
            .withGraphFetched('[user, settings, businessTheme]')
            .findById(id);
        const encodedLink = incrementalIdEncrypt(business.id);
        business.businessTheme.encodedLink = encodedLink;
        return res.json({
            success: true,
            business: await getBusinessWithPaymentStatementDescriptor(business),
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Fetch an individual business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualBusiness(req, res, next) {
    try {
        const isValid = validateParamsIdType(req);

        if (!isValid) {
            return res.status(409).json({
                error: ERROR_MESSAGES.INVALID_PARAM_ID,
            });
        }

        const business = await Business.query()
            .withGraphFetched('[user, settings, businessTheme]')
            .findById(req.params.id);
        const encodedLink = incrementalIdEncrypt(business.id);
        business.businessTheme.encodedLink = encodedLink;
        return res.json({
            success: true,
            business: await getBusinessWithPaymentStatementDescriptor(business),
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getAllBusinesses,
    createNewBusiness,
    updateFieldValueForBusiness,
    getAllStoresPerBusiness,
    searchBusinesses,
    getAllBusinessesSimple,
    updateBusinessSettings,
    getIndividualBusiness,
};

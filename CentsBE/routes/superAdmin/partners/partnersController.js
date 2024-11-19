// Packages & Config
const { transaction } = require('objection');
const stripe = require('../../stripe/config');

// Models
const PartnerEntity = require('../../../models/partnerEntity');
const PartnerSubsidiary = require('../../../models/partnerSubsidiary');
const PartnerSubsidiaryPaymentMethod = require('../../../models/partnerSubsidiaryPaymentMethod');
const PartnerSubsidiaryStore = require('../../../models/partnerSubsidiaryStore');

/**
 * Get a list of all PartnerEntity models in our system
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllPartnerEntities(req, res, next) {
    try {
        const { pageNumber } = req.query;

        const partnerEntities = await PartnerEntity.query()
            .page(pageNumber, 20)
            .orderBy('createdAt', 'desc');

        return res.json({
            success: true,
            partners: partnerEntities,
            total: partnerEntities.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Create a PartnerEntity model and any child associations
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createPartnerEntity(req, res, next) {
    let trx = null;

    try {
        const { partner, subsidiaries } = req.body;

        trx = await transaction.start(PartnerEntity.knex());

        const newPartner = await PartnerEntity.query(trx).insertGraph({
            name: partner.name,
            logoUrl: partner.logoUrl,
            subsidiaries,
        });

        await trx.commit();

        return res.json({
            success: true,
            partner: newPartner,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Format the PartnerSubsidiaryPaymentMethod
 *
 * @param {Object} paymentMethod
 * @returns {Object} response
 */
async function getStripeCardDetails(paymentMethod) {
    const response = {};

    if (paymentMethod.provider === 'stripe') {
        const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethod.paymentMethodToken);

        response.last4 = stripeMethod.card.last4;
        response.brand = stripeMethod.card.brand;
    } else {
        response.last4 = null;
        response.brand = null;
    }

    response.partnerSubsidiaryId = paymentMethod.partnerSubsidiaryId;
    response.provider = paymentMethod.provider;
    response.type = paymentMethod.type;
    response.paymentMethodToken = paymentMethod.paymentMethodToken;
    response.id = paymentMethod.id;

    return response;
}

/**
 * Format an individual subsidiary for the API response
 *
 * @param {Object} subsidiary
 */
async function formatIndividualSubsidiary(subsidiary) {
    const response = {};
    let paymentMethods = [];

    response.id = subsidiary.id;
    response.createdAt = subsidiary.createdAt;
    response.updatedAt = subsidiary.updatedAt;
    response.name = subsidiary.name;
    response.partnerEntityId = subsidiary.partnerEntityId;
    response.logoUrl = subsidiary.logoUrl;
    response.type = subsidiary.type;
    response.store = subsidiary.store;
    response.subsidiaryCode = subsidiary.subsidiaryCode;

    if (subsidiary.paymentMethods.length > 0) {
        paymentMethods = subsidiary.paymentMethods.map((method) => getStripeCardDetails(method));

        paymentMethods = await Promise.all(paymentMethods);
    }

    response.paymentMethods = paymentMethods;

    return response;
}

/**
 * Format the PartnerEntity and relations
 *
 * @param {Object} partner
 */
async function formatPartnerEntityResponse(partner) {
    const response = {};
    let subsidiaries = [];

    response.id = partner.id;
    response.createdAt = partner.createdAt;
    response.updatedAt = partner.updatedAt;
    response.name = partner.name;
    response.logoUrl = partner.logoUrl;

    if (partner.subsidiaries.length > 0) {
        subsidiaries = partner.subsidiaries.map((sub) => formatIndividualSubsidiary(sub));

        subsidiaries = await Promise.all(subsidiaries);
    }

    response.subsidiaries = subsidiaries;

    return response;
}

/**
 * Retrieve an individual PartnerEntity and any child components
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualPartner(req, res, next) {
    try {
        const { id } = req.params;

        const partner = await PartnerEntity.query()
            .withGraphFetched('subsidiaries.[paymentMethods, store]')
            .findById(id);

        const formattedPartner = await formatPartnerEntityResponse(partner);

        return res.json({
            success: true,
            partner: formattedPartner,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update an individual value in the PartnerEntity model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function updateIndividualPartnerEntity(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(PartnerEntity.knex());

        const partnerEntity = await PartnerEntity.query(trx)
            .withGraphFetched('subsidiaries.[paymentMethods, store]')
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        const formattedPartner = await formatPartnerEntityResponse(partnerEntity);

        return res.json({
            success: true,
            partner: formattedPartner,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Update an individual value in the PartnerSubsidiary model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function updateIndividualPartnerSubsidiary(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(PartnerSubsidiary.knex());

        const partnerSubsidiary = await PartnerSubsidiary.query(trx)
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        const partner = await PartnerEntity.query()
            .withGraphFetched('subsidiaries.[paymentMethods, store]')
            .findById(partnerSubsidiary.partnerEntityId)
            .returning('*');

        const formattedPartner = await formatPartnerEntityResponse(partner);

        return res.json({
            success: true,
            partner: formattedPartner,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Add a Stripe PaymentMethod to a PartnerSubsidiary
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function addPaymentMethodToSubsidiary(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { provider, type, paymentMethodToken, isDefault } = req.body;
        const partnerSubsidiary = await PartnerSubsidiary.query().findById(id);

        const partnerStripeCustomer = await stripe.customers.create({
            name: partnerSubsidiary.name,
            payment_method: paymentMethodToken,
        });

        trx = await transaction.start(PartnerSubsidiaryPaymentMethod.knex());

        await PartnerSubsidiaryPaymentMethod.query(trx).insert({
            partnerSubsidiaryId: id,
            provider,
            type,
            paymentMethodToken,
            isDefault,
            partnerStripeCustomerId: partnerStripeCustomer.id,
        });

        await trx.commit();

        const partner = await PartnerEntity.query()
            .withGraphFetched('subsidiaries.[paymentMethods, store]')
            .findById(partnerSubsidiary.partnerEntityId)
            .returning('*');

        const formattedPartner = await formatPartnerEntityResponse(partner);

        return res.json({
            success: true,
            partner: formattedPartner,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Attach a PartnerSubsidiary to a Store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function attachPartnerSubsidiaryToStore(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { storeId } = req.body;

        trx = await transaction.start(PartnerSubsidiaryStore.knex());

        await PartnerSubsidiaryStore.query(trx).insert({
            partnerSubsidiaryId: id,
            storeId,
        });

        await trx.commit();

        const partnerSubsidiary = await PartnerSubsidiary.query().findById(id);
        const partner = await PartnerEntity.query()
            .withGraphFetched('subsidiaries.[paymentMethods, store]')
            .findById(partnerSubsidiary.partnerEntityId);
        const formattedPartner = await formatPartnerEntityResponse(partner);

        return res.json({
            success: true,
            partner: formattedPartner,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Create a new PartnerSubsidiary for a given PartnerEntity
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createNewPartnerSubsidiary(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const { name, logoUrl, type, storeId } = req.body;

        trx = await transaction.start(PartnerSubsidiary.knex());

        const partnerSubsidiary = await PartnerSubsidiary.query(trx)
            .insert({
                name,
                logoUrl,
                type,
                partnerEntityId: id,
            })
            .returning('*');

        if (storeId) {
            await PartnerSubsidiaryStore.query(trx).insert({
                storeId,
                parterSubsidiaryId: partnerSubsidiary.id,
            });
        }

        await trx.commit();

        return res.json({
            success: true,
            subsidiary: partnerSubsidiary,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = {
    getAllPartnerEntities,
    createPartnerEntity,
    getIndividualPartner,
    updateIndividualPartnerEntity,
    updateIndividualPartnerSubsidiary,
    addPaymentMethodToSubsidiary,
    attachPartnerSubsidiaryToStore,
    createNewPartnerSubsidiary,
};

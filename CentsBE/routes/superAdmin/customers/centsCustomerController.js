// Utils
const { transaction, raw } = require('objection');
const { orderBy } = require('lodash');
const newCreditInputValidation = require('../../../utils/newCreditInputValidation');

// models
const creditHistory = require('../../../models/creditHistory');
const CentsCustomer = require('../../../models/centsCustomer');
const CreditReason = require('../../../models/creditReasons');

// pipelines
const uploadCustomersPipeline = require('../../../pipeline/superAdmin/customers/uploadCustomersPipeline');

// events
const eventEmitter = require('../../../config/eventEmitter');
const StoreCustomer = require('../../../models/storeCustomer');

/**
 * Get a list of all CentsCustomer entries in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns JSON
 */
async function getCentsCustomers(req, res, next) {
    try {
        const { pageNumber, searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const centsCustomers = await CentsCustomer.query()
            .omit(['password', 'resetPasswordToken', 'passwordResetDate'])
            .orWhere('centsCustomers.firstName', 'ilike', `%${searchTerm}%`)
            .orWhere('centsCustomers.lastName', 'ilike', `%${searchTerm}%`)
            .orWhere('centsCustomers.email', 'ilike', `%${searchTerm}%`)
            .orWhere(
                raw('concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")'),
                'ilike',
                `%${searchTerm}%`,
            )
            .orWhere(
                raw('concat("centsCustomers"."lastName", \' \', "centsCustomers"."firstName")'),
                'ilike',
                `%${searchTerm}%`,
            )
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder
                        .orWhere('centsCustomers.phoneNumber', '=', searchTerm)
                        .orWhere('centsCustomers.id', '=', searchTerm);
                }
            })
            .page(pageNumber, 20)
            .orderBy('createdAt', 'desc');

        return res.json({
            success: true,
            customers: centsCustomers,
            total: centsCustomers.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Format customer with appropriate details and credit totals for each business for front-end
 *
 * @param {Object} centsCustomerData
 */
const mapCentsCustomerData = (centsCustomerData) => {
    const mappedData = {};

    if (centsCustomerData) {
        mappedData.id = centsCustomerData.centsCustomerId;
        mappedData.firstName = centsCustomerData.firstName;
        mappedData.lastName = centsCustomerData.lastName;
        mappedData.phoneNumber = centsCustomerData.phoneNumber;
        mappedData.email = centsCustomerData.email;
        mappedData.creditsByBusiness = [];
        mappedData.creditHistory = centsCustomerData.creditHistory[0].creditHistoryId
            ? centsCustomerData.creditHistory
            : [];

        if (centsCustomerData.creditHistory[0].creditHistoryId) {
            const creditsByBusiness = {};

            centsCustomerData.creditHistory.forEach((credit) => {
                if (!creditsByBusiness[credit.businessId]) {
                    creditsByBusiness[credit.businessId] = {
                        businessId: credit.businessId,
                        businessName: credit.businessName,
                        createdAt: credit.createdAt,
                        credits: [],
                    };
                }
                creditsByBusiness[credit.businessId].credits.push(credit.amount);
            });

            for (const [key, data] of Object.entries(creditsByBusiness)) {
                const totalCredit = data.credits.reduce((partialSum, a) => partialSum + a, 0);
                mappedData.creditsByBusiness.push({
                    businessId: Number(key),
                    businessName: data.businessName,
                    totalCredit: totalCredit.toFixed(2),
                });
            }

            mappedData.creditsByBusiness = orderBy(
                mappedData.creditsByBusiness,
                (credit) => credit.businessName.toLowerCase(),
                ['asc'],
            );
        }
    }

    return mappedData;
};

const getCustomerData = async (id) => {
    const centsCustomerData = await CentsCustomer.query()
        .select(
            'centsCustomers.id as centsCustomerId',
            'centsCustomers.firstName as firstName',
            'centsCustomers.lastName as lastName',
            'centsCustomers.email as email',
            'centsCustomers.phoneNumber as phoneNumber',
            raw(`array_agg(
                        distinct jsonb_build_object(
                            'creditHistoryId', "creditHistory"."id"
                            ,'amount', "creditHistory"."amount"
                            ,'businessId', "creditHistory"."businessId"
                            ,'businessName',"laundromatBusiness"."name"
                            ,'createdAt',"laundromatBusiness"."createdAt"
                            ,'reasonId',"creditHistory"."reasonId"
                            ,'reason',"creditReasons"."reason"
                        )
                    )
                    as "creditHistory"`),
        )
        .leftJoin('creditHistory', 'creditHistory.customerId', 'centsCustomers.id')
        .leftJoin('laundromatBusiness', 'laundromatBusiness.id', 'creditHistory.businessId')
        .leftJoin('creditReasons', 'creditReasons.id', 'creditHistory.reasonId')
        .groupBy('centsCustomers.id')
        .findById(id);

    return mapCentsCustomerData(centsCustomerData);
};

/**
 * Get individual customer details
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualCustomer(req, res, next) {
    try {
        const { id } = req.params;

        const centsCustomer = await getCustomerData(id);

        return res.json({
            success: true,
            customer: centsCustomer,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update an individual value in the CentsCustomer model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function updateIndividualCustomer(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(CentsCustomer.knex());

        const { storeCustomers } = await CentsCustomer.query(trx)
            .withGraphFetched('[storeCustomers, addresses, paymentMethods]')
            .omit(['password', 'resetPasswordToken', 'passwordResetDate'])
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        if (storeCustomers && storeCustomers.length) {
            storeCustomers.map((storeCustomer) =>
                eventEmitter.emit('indexCustomer', storeCustomer.id),
            );
        }

        const centsCustomer = await getCustomerData(id);

        return res.json({
            success: true,
            customer: centsCustomer,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Upload a list of customers for a given business and list of stores
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function uploadCustomerList(req, res, next) {
    try {
        const output = await uploadCustomersPipeline(req.body);
        eventEmitter.emit('uploadCustomerList', output);

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Add credit to customer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */

async function addCreditToCustomer(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(creditHistory.knex());
        const isValid = newCreditInputValidation(req.body);

        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0].replace(/["']/g, ''),
            });
            return;
        }

        const credits = await creditHistory
            .query(trx)
            .insert({
                businessId: req.body.businessId,
                reasonId: req.body.reasonId,
                amount: req.body.creditAmount,
                customerId: req.body.customerId,
            })
            .returning('*');
        await trx.commit();
        const storeCustomer = await StoreCustomer.query(trx).findOne({
            businessId: req.body.businessId,
            centsCustomerId: req.body.customerId,
        });
        eventEmitter.emit('indexCustomer', storeCustomer.id);
        res.status(200).json({
            success: true,
            credits,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

/**
 * get credit reasons
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */

async function getCreditReasons(req, res, next) {
    try {
        const reasons = await CreditReason.query().select('id', 'reason');
        res.status(200).json({
            success: true,
            reasons,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getIndividualCustomer,
    updateIndividualCustomer,
    uploadCustomerList,
    getCentsCustomers,
    addCreditToCustomer,
    getCreditReasons,
};

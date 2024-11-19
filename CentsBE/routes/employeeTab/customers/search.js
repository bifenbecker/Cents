const { raw } = require('objection');
const { get } = require('lodash');
const Joi = require('@hapi/joi');
const CentsCustomer = require('../../../models/centsCustomer');
const { search } = require('../../businessOwner/customers/search');
const { languages } = require('../../../constants/constants');
const { getCustomers } = require('../../../services/queries/customerQueries');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string().valid(['phoneNumber', 'email', 'name']).optional().allow(null, ''),
        keyword: Joi.string(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function returnSubQuery(query, userField, secondaryDetailsField, keyword) {
    query
        .where(`centsCustomers.${userField}`, 'ilike', `%${keyword}%`)
        .orWhere(`storeCustomers.${secondaryDetailsField}`, 'ilike', `%${keyword}%`);
    return query;
}

/**
 * Determine whether two incoming property values inside an object are equal
 *
 * @param {Object} subject
 * @param {Object} target
 * @param {Array} propNames
 */
function arePropertyValuesEqual(subject, target, propNames) {
    return propNames.every((propName) => subject[propName] === target[propName]);
}

/**
 * Filter out unique items in an array based on an incoming key or keys you identify
 *
 * @param {*} items
 * @param {*} propNames
 */
function getUniqueItemsByKeys(items, propNames) {
    const propNamesArray = Array.from(propNames);

    return items.filter(
        (item, index, array) =>
            index ===
            array.findIndex((foundItem) => arePropertyValuesEqual(foundItem, item, propNamesArray)),
    );
}

function mapResponse(input) {
    const response = {};
    response.fullName = input.fullName;
    response.firstName = input.firstName;
    response.lastName = input.lastName;
    response.email = input.email;
    response.phoneNumber = input.phoneNumber;
    response.languageId = input.languageId;
    response.language = languages[response.languageId];
    response.availableCredit = Number(input.creditAmount);
    response.centsCustomerId = input.centsCustomerId;
    response.stripeCustomerId = input.stripeCustomerId;
    response.order = input.order;
    response.notes = input.storeCustomerNotes ? input.storeCustomerNotes : '';
    response.id = input.centsCustomerId;
    response.storeCustomerId = input.storeCustomerId;
    response.addresses = input.addresses;
    response.isHangDrySelected = input.boIsHangDrySelected;
    response.hangDryInstructions = input.boHangDryInstructions;

    response.isCommercial = input.isCommercial;
    response.isInvoicingEnabled = input.isInvoicingEnabled;
    response.tier = input.pricingTierId
        ? {
              id: input.pricingTierId,
              name: input.pricingTierName,
          }
        : {};

    return response;
}

async function searchCustomers(req, res, next) {
    try {
        const { keyword, pageNo, field } = req.query;
        if (!keyword.trim()) {
            res.status(422).json({
                error: 'Keyword is required',
            });
            return;
        }
        const { businessId } = req.currentStore;
        let users = {};
        if (!field) {
            users = await search(businessId, keyword, pageNo);
        } else {
            const isValid = typeValidations({ field });
            if (isValid.error) {
                res.status(422).json({
                    error: isValid.error.message,
                });
                return;
            }

            users = CentsCustomer.query()
                .select(
                    raw(`
                    "storeCustomers"."id" as id,
                    "storeCustomers"."notes" as notes,
                    trim(coalesce(concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName"),
                    concat("centsCustomers"."firstName", ' ', "centsCustomers"."lastName"))) as "fullName",
                    coalesce("storeCustomers"."phoneNumber", "centsCustomers"."phoneNumber") as "phoneNumber",
                    coalesce("storeCustomers"."email", "centsCustomers"."email") as email,
                    "centsCustomerId", sum("creditHistory"."amount") as "creditAmount",
                    coalesce("storeCustomers"."languageId", "centsCustomers"."languageId") as "languageId"`),
                    'stores.name as storeName',
                )
                .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
                .join('stores', 'stores.id', 'storeCustomers.storeId')
                .leftJoin('creditHistory', 'creditHistory.customerId', 'centsCustomers.id')
                .where('storeCustomers.businessId', req.currentStore.businessId);

            users =
                field === 'phoneNumber'
                    ? users.where((query) => {
                          returnSubQuery(query, 'phoneNumber', 'phoneNumber', keyword);
                      })
                    : users;
            users =
                field === 'email'
                    ? users.where((query) => {
                          returnSubQuery(query, 'email', 'email', keyword);
                      })
                    : users;
            users =
                field === 'name'
                    ? users.where((query) => {
                          query
                              .where(
                                  raw(
                                      'concat("storeCustomers"."firstName", \' \', "storeCustomers"."lastName")',
                                  ),
                                  'ilike',
                                  `%${keyword}%`,
                              )
                              .orWhere(
                                  raw(
                                      'concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")',
                                  ),
                                  'ilike',
                                  `%${keyword}%`,
                              );
                      })
                    : users;
            users = await users.limit(30);
        }
        res.status(200).json({
            success: true,
            details: users,
            next: users.length > 29,
        });
    } catch (error) {
        next(error);
    }
}

async function storeCustomersSearch(req, res, next) {
    try {
        const { keyword, pageNo, field } = req.query;
        if (!keyword.trim()) {
            res.status(422).json({
                error: 'Keyword is required',
            });
            return;
        }
        const { businessId } = req.currentStore;
        let users = {};
        if (!field) {
            users = await search(businessId, keyword, pageNo);
        } else {
            const isValid = typeValidations({ field });
            if (isValid.error) {
                res.status(422).json({
                    error: isValid.error.message,
                });
                return;
            }
            users = CentsCustomer.query()
                .select(
                    raw(`
                    "storeCustomers"."id" as id,
                    trim(coalesce(concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName"),
                    concat("centsCustomers"."firstName", ' ', "centsCustomers"."lastName"))) as "fullName",
                    "centsCustomers"."firstName" as firstName,
                    "centsCustomers"."lastName" as lastName,
                    coalesce("storeCustomers"."phoneNumber", "centsCustomers"."phoneNumber") as "phoneNumber",
                    coalesce("storeCustomers"."email", "centsCustomers"."email") as email,
                    "centsCustomerId",
                    coalesce("storeCustomers"."languageId", "centsCustomers"."languageId") as "languageId"`),
                    'stores.name as storeName',
                )
                .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
                .where('storeCustomers.storeId', req.currentStore.id);

            users =
                field === 'phoneNumber'
                    ? users.where((query) => {
                          returnSubQuery(query, 'phoneNumber', 'phoneNumber', keyword);
                      })
                    : users;
            users =
                field === 'email'
                    ? users.where((query) => {
                          returnSubQuery(query, 'email', 'email', keyword);
                      })
                    : users;
            users =
                field === 'name'
                    ? users.where((query) => {
                          query
                              .where(
                                  raw(
                                      'concat("storeCustomers"."firstName", \' \', "storeCustomers"."lastName")',
                                  ),
                                  'ilike',
                                  `%${keyword}%`,
                              )
                              .orWhere(
                                  raw(
                                      'concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")',
                                  ),
                                  'ilike',
                                  `%${keyword}%`,
                              );
                      })
                    : users;
            users = await users.limit(31);
        }
        res.status(200).json({
            success: true,
            details: users,
            next: users.length > 30,
        });
    } catch (error) {
        next(error);
    }
}

async function centsCustomersSearch(req, res, next) {
    try {
        const { keyword, field } = req.query;
        const page = req.query.page || 1;
        const isValid = typeValidations({
            keyword,
            field,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { businessId, id } = req.currentStore;

        let customers = getCustomers(id, businessId, null, page);

        customers =
            field === 'phoneNumber'
                ? customers.where((query) => {
                      query.where('centsCustomers.phoneNumber', 'ilike', `%${keyword}%`);
                  })
                : customers;
        customers =
            field === 'email'
                ? customers.where((query) => {
                      query.where('centsCustomers.email', 'ilike', `%${keyword}%`);
                  })
                : customers;
        customers =
            field === 'name'
                ? customers.where((query) => {
                      query.where(
                          raw(
                              'concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")',
                          ),
                          'ilike',
                          `%${keyword}%`,
                      );
                  })
                : customers;

        if (typeof field === 'undefined') {
            customers = customers.where((query) =>
                query
                    .where(
                        raw(
                            'concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")',
                        ),
                        'ilike',
                        `%${keyword}%`,
                    )
                    .orWhere(raw('"centsCustomers"."email"'), 'ilike', `%${keyword}%`)
                    .orWhere(raw('"centsCustomers"."phoneNumber"'), 'ilike', `%${keyword}%`),
            );
        }
        customers = await customers;

        const storeCustomerList = customers.filter((customer) => customer.storeId === id);
        customers =
            storeCustomerList.length > 0
                ? storeCustomerList
                : getUniqueItemsByKeys(customers, 'id');

        res.status(200).json({
            success: true,
            details: customers.map((customer) => mapResponse(customer)),
            next: customers.length > 10,
        });
    } catch (error) {
        next(error);
    }
}

function formatElasticSearchRes(businessCustomer, currentStoreId) {
    const {
        storeCustomers,
        centsCustomerId,
        fullName,
        email,
        phoneNumber,
        isCommercial,
        isInvoicingEnabled,
        storeIds,
        stripeCustomerId,
    } = businessCustomer;

    const currentStoreCustomer = storeCustomers.length
        ? storeCustomers.find((storeCustomer) => storeCustomer.storeId === currentStoreId) || {}
        : {};
    if (currentStoreCustomer && !get(currentStoreCustomer, 'order.orderId')) {
        delete currentStoreCustomer.order;
    }
    return {
        id: centsCustomerId,
        fullName,
        email,
        phoneNumber,
        centsCustomerId,
        isCommercial,
        isInvoicingEnabled,
        stripeCustomerId,
        storeIds,
        storeCustomerId: currentStoreCustomer.id,
        isHangDrySelected: currentStoreCustomer.isHangDrySelected,
        hangDryInstructions: currentStoreCustomer.hangDryInstructions,
        order: currentStoreCustomer.order,
        language: languages[currentStoreCustomer.languageId],
        availableCredit: currentStoreCustomer.availableCredit,
        notes: currentStoreCustomer.notes,
    };
}

module.exports = exports = {
    storeCustomersSearch,
    searchCustomers,
    returnSubQuery,
    centsCustomersSearch,
    mapResponse,
    getUniqueItemsByKeys,
    formatElasticSearchRes,
};

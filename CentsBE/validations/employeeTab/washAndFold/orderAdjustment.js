const Joi = require('@hapi/joi');
const { joiValidationCommonErrHandler } = require('../../validationUtil');
const employeeDetailsQuery = require('../../../queryHelpers/employeeDetailsQuery');
const validateEmployeeCode = require('../../validateEmployeeCode');
const ServiceOrder = require('../../../models/serviceOrders');
const BusinessSettings = require('../../../models/businessSettings');

function typeValidation(inputObj, requiresEmployeeCode, version, cents20LdFlag) {
    let schema = Joi.object().keys({
        id:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.number().required()
                : Joi.allow(null, '').optional(),
        orderId: Joi.number().min(1).required().error(joiValidationCommonErrHandler),
        promotionId: Joi.number().optional().allow(null),
        totalWeight: Joi.number().required().error(joiValidationCommonErrHandler),
        chargeableWeight: Joi.number().optional(),
        tipAmount: Joi.number().optional().allow(null),
        convenienceFeeId: Joi.number().optional().allow(null),
        creditAmount: Joi.number().optional().allow(null),
        customerNotes: Joi.string().allow('', null).optional(),
        notes: Joi.string().allow('', null).optional(),
        orderItems: Joi.array().items(
            Joi.object().keys({
                id: Joi.number().integer().optional(),
                isDeleted: Joi.boolean().optional(),
                priceId: Joi.when('isDeleted', {
                    is: true,
                    then: Joi.number().optional(),
                    otherwise: Joi.number().required(),
                }),
                count: Joi.when('category', {
                    is: Joi.string().valid('PER_POUND'),
                    then: Joi.number().required(),
                    otherwise: Joi.number().min(1).integer().required(),
                }),
                category:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.string().required(),
                              otherwise: Joi.string().required(),
                          })
                        : Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.string().required(),
                              otherwise: Joi.string().valid('INVENTORY').required(),
                          }),
                weight: Joi.when('category', {
                    is: Joi.string().valid('PER_POUND'),
                    then: Joi.when('isDeleted', {
                        is: true,
                        then: Joi.number().optional(),
                        otherwise: Joi.number().min(0.1).required(),
                    }),
                    otherwise: Joi.number().allow(null).optional(),
                }),
                lineItemType: Joi.string()
                    .valid('SERVICE', 'INVENTORY')
                    .required()
                    .error(joiValidationCommonErrHandler),
                serviceModifierIds: Joi.array().items(Joi.number().integer().optional()),
                serviceCategoryType:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.string()
                                  .valid('DRY_CLEANING', 'LAUNDRY', 'ALTERATIONS')
                                  .required(),
                              otherwise: Joi.allow(null, '').optional(),
                          })
                        : Joi.string().allow(null, '').optional(),
                turnAroundInHours:
                    version >= '2.0.0' && cents20LdFlag ? Joi.number() : Joi.number().optional(),
                pricingType:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.string().required(),
                              otherwise: Joi.allow(null, '').optional(),
                          })
                        : Joi.string().valid('PER_POUND', 'FIXED_PRICE').optional(),
                modifiers:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.array().allow(null, '').optional()
                        : Joi.optional(),
            }),
        ),
        storeId: Joi.number().required(),
        orderType: Joi.string().required().valid('ServiceOrder'),
        serviceOrderBags:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array()
                      .items(
                          Joi.object().keys({
                              id: Joi.number().optional(),
                              notes: Joi.array()
                                  .items(
                                      Joi.object().keys({
                                          id: Joi.number().optional(),
                                          name: Joi.string().allow('', null).optional(),
                                      }),
                                  )
                                  .allow(null, '')
                                  .optional(),
                              manualNote: Joi.string().allow('', null).optional(),
                              isDeleted: Joi.boolean().optional(),
                          }),
                      )
                      .optional()
                : Joi.allow(null, '').optional(),
        hangerBundles:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array().items(
                      Joi.object().keys({
                          id: Joi.number().optional(),
                          notes: Joi.array()
                              .items(
                                  Joi.object().keys({
                                      id: Joi.number().optional(),
                                      name: Joi.string().required(),
                                  }),
                              )
                              .allow(null, '')
                              .optional(),
                          manualNote: Joi.string().allow('', null).optional(),
                          isDeleted: Joi.boolean().optional(),
                      }),
                  )
                : Joi.array().items().allow(null, ''),
        storageRacks:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array()
                      .items(
                          Joi.object().keys({
                              id: Joi.number().optional(),
                              rackInfo: Joi.string().required().allow(null, ''),
                          }),
                      )
                      .allow(null, '')
                : Joi.array().items().allow(null, ''),
    });

    if (requiresEmployeeCode) {
        schema = schema.append({
            employeeCode: Joi.number().integer().required(),
        });
    } else {
        schema = schema.append({
            employeeCode: Joi.number().integer().optional().allow(null),
        });
    }

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: req.currentStore.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;
        const { id } = req.params;
        const { requiresEmployeeCode } = req.currentStore.settings;
        const isValid = typeValidation(
            req.body,
            requiresEmployeeCode,
            req.apiVersion,
            cents20LdFlag,
        );
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const serviceOrder = await ServiceOrder.query()
            .where('id', id)
            .andWhere((query) => {
                query.where('storeId', req.currentStore.id).orWhere('hubId', req.currentStore.id);
            })
            .first();
        if (!serviceOrder) {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        req.constants = req.constants || {};
        if (requiresEmployeeCode) {
            const { employeeCode } = req.body;
            await validateEmployeeCode(
                employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
            const employee = await employeeDetailsQuery(employeeCode, req.currentStore.businessId);
            const employeeDetails = {
                employeeCode,
                ...employee[0],
            };
            req.constants.employee = employeeDetails;
        }
        req.constants.serviceOrder = serviceOrder;
        req.cents20LdFlag = cents20LdFlag;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

const Joi = require('@hapi/joi');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

const employeeDetailsQuery = require('../../../queryHelpers/employeeDetailsQuery');
const { joiValidationCommonErrHandler } = require('../../validationUtil');
const validateEmployeeCode = require('../../validateEmployeeCode');
const validateServiceOrder = require('../../../uow/order/serviceOrder/validateServiceOrder');

const BusinessSettings = require('../../../models/businessSettings');

// TODO: Add modifier details validations.
function typeValidations(input, requiresEmployeeCode, version, cents20LdFlag) {
    let schema = Joi.object().keys({
        promotionId: Joi.number().optional().allow(null),
        totalWeight: Joi.number().required().error(joiValidationCommonErrHandler),
        chargeableWeight: Joi.number().optional().allow(null),
        tipAmount: Joi.number().optional().allow(null),
        convenienceFeeId: Joi.number().optional().allow(null),
        creditAmount: Joi.number().optional().allow(null),
        pickupDeliveryFee: Joi.number().optional().allow(null),
        pickupDeliveryTip: Joi.number().optional().allow(null),
        returnDeliveryFee: Joi.number().optional().allow(null),
        returnDeliveryTip: Joi.number().optional().allow(null),
        isBagTrackingEnabled: Joi.boolean().required(),
        notes: Joi.string().allow('', null).optional(),
        paymentTiming: Joi.string().required(),
        paymentStatus: Joi.string().optional(),
        customer: Joi.object().keys({
            id: Joi.number().integer().required(),
            storeCustomerId: Joi.number().optional().allow(null),
            customerNotes: Joi.string().allow('', null).optional(),
            stripeCustomerId: Joi.string().allow('', null).optional(),
            centsCustomerId: Joi.number().optional().allow(null),
            isHangDrySelected: Joi.boolean().optional().allow(null, ''),
            hangDryInstructions: Joi.string().allow('', null).optional(),
        }),
        orderItems: Joi.array().items(
            Joi.object().keys({
                priceId: Joi.number().integer().required(),
                count: Joi.when('category', {
                    is: Joi.string().valid('PER_POUND'),
                    then: Joi.number().required(),
                    otherwise: Joi.number().min(1).integer().required(),
                }),
                pricingType:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.string().valid('PER_POUND', 'FIXED_PRICE').required()
                        : Joi.string().valid('PER_POUND', 'FIXED_PRICE').optional(),
                category: Joi.when('lineItemType', {
                    is: Joi.string().valid('SERVICE'),
                    then: Joi.string().valid('PER_POUND', 'FIXED_PRICE'),
                    otherwise: Joi.string().valid('INVENTORY').required(),
                }),
                weight: Joi.when('category', {
                    is: Joi.string().valid('PER_POUND'),
                    then: Joi.number().min(0.1).required(),
                    otherwise: Joi.number().allow(null).optional(),
                }),
                lineItemType: Joi.string()
                    .valid('SERVICE', 'INVENTORY')
                    .required()
                    .error(joiValidationCommonErrHandler),
                serviceModifierIds: Joi.array().items(Joi.number().integer().optional()),
                turnAroundInHours:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.number().required(),
                              otherwise: Joi.allow(null, '').optional(),
                          })
                        : Joi.number().optional(),
                modifiers: Joi.array().allow(null, '').optional(),
                serviceCategoryType:
                    version >= '2.0.0' && cents20LdFlag
                        ? Joi.when('lineItemType', {
                              is: Joi.string().valid('SERVICE'),
                              then: Joi.string()
                                  .valid('DRY_CLEANING', 'LAUNDRY', 'ALTERATIONS')
                                  .required(),
                              otherwise: Joi.allow(null, '').optional(),
                          })
                        : Joi.string().valid('PER_POUND', 'FIXED_PRICE').optional(),
            }),
        ),
        bags:
            version <= '2.0.0' && !cents20LdFlag
                ? Joi.array().items(
                      Joi.object().keys({
                          barcode: Joi.when('isBagTrackingEnabled', {
                              is: true,
                              then: Joi.string().required(),
                              otherwise: Joi.string().allow(null, '').optional(),
                          }),
                          description: Joi.string().allow(null, '').optional(),
                          notes: Joi.string().allow(null, '').optional(),
                      }),
                  )
                : Joi.allow('', null).optional(),
        serviceOrderBags:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array()
                      .items(
                          Joi.object().keys({
                              notes: Joi.array()
                                  .items(
                                      Joi.object().keys({
                                          id: Joi.number().integer().required(),
                                          name: Joi.string().required(),
                                      }),
                                  )
                                  .allow(null, '')
                                  .optional(),
                              manualNote: Joi.string().allow('', null).optional(),
                          }),
                      )
                      .optional()
                : Joi.array().items(
                      Joi.object().keys({
                          barcode: Joi.when('isBagTrackingEnabled', {
                              is: true,
                              then: Joi.string().required(),
                              otherwise: Joi.string().allow(null, '').optional(),
                          }),
                          description: Joi.string().allow(null, '').optional(),
                          notes: Joi.string().allow(null, '').optional(),
                      }),
                  ),
        hangerBundles:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array().items(
                      Joi.object().keys({
                          notes: Joi.array()
                              .items(
                                  Joi.object().keys({
                                      id: Joi.number().integer().required(),
                                      name: Joi.string().required(),
                                  }),
                              )
                              .allow(null, '')
                              .optional(),
                          manualNote: Joi.string().allow('', null).optional(),
                      }),
                  )
                : Joi.array().items().allow(null, ''),
        storageRacks:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.array()
                      .items(
                          Joi.object().keys({
                              rackInfo: Joi.string().required().allow(null, ''),
                          }),
                      )
                      .allow(null, '')
                : Joi.array().items().allow(null, ''),
        storeId: Joi.number().required(),
        orderType: Joi.string().required().valid('ServiceOrder'),
        turnAroundInHours:
            version >= '2.0.0' && cents20LdFlag
                ? Joi.object()
                      .keys({
                          value: Joi.number().required(),
                          setManually: Joi.boolean().required(),
                      })
                      .required()
                : Joi.number().optional().allow(null, ''),
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

    const error = Joi.validate(input, schema);
    return error;
}

async function validate(req, res, next) {
    try {
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: req.currentStore.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;
        const { requiresEmployeeCode } = req.currentStore.settings;
        const isValid = typeValidations(
            req.body,
            requiresEmployeeCode,
            req.apiVersion,
            cents20LdFlag,
        );

        if (isValid.error) {
            LoggerHandler(
                'error',
                `Validation error in creating a ServiceOrder for store ID ${req?.currentStore?.id}`,
                isValid?.error,
            );
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { employeeCode, storeId, customer } = req.body;
        req.constants = {};
        if (requiresEmployeeCode) {
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
            req.cents20LdFlag = cents20LdFlag;
        }

        // check if duplicate order exists and drop accordingly
        const isDuplicateOrder = !(await validateServiceOrder({
            storeId,
            centsCustomerId: customer.id,
        }));
        if (isDuplicateOrder) {
            const message = 'Duplicate order recently placed for customer';
            LoggerHandler('error', message, req.body);
            res.status(200).json({
                success: true,
                message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validate,
};

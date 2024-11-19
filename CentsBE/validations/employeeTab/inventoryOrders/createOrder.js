const Joi = require('@hapi/joi');
const validateEmployeeCode = require('../../validateEmployeeCode');
const employeeDetailsQuery = require('../../../queryHelpers/employeeDetailsQuery');
const getDuplicateInventoryOrder = require('../../../uow/order/inventoryOrder/getDuplicateInventoryOrder');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

function typeValidations(inputObj, requiresEmployeeCode) {
    let schema = Joi.object().keys({
        customer: Joi.object().keys({
            id: Joi.number().integer().required(),
            stripeCustomerId: Joi.string().allow('', null).optional(),
            storeCustomerId: Joi.number().allow(null).optional(),
            centsCustomerId: Joi.number().optional().allow(null),
            customerNotes: Joi.string().optional().allow(null, ''),
        }),
        promotionId: Joi.number().optional().allow(null),
        tipAmount: Joi.number().optional().allow(null),
        convenienceFeeId: Joi.number().optional().allow(null),
        creditAmount: Joi.number().optional().allow(null),
        orderItems: Joi.array()
            .items(
                Joi.object().keys({
                    priceId: Joi.number().integer().required(),
                    count: Joi.number().integer().min(1),
                    lineItemType: Joi.string().required(),
                }),
            )
            .min(1)
            .required(),
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
    const isValid = Joi.validate(inputObj, schema);
    return isValid;
}

async function requestValidator(req, res, next) {
    try {
        const {
            settings: { requiresEmployeeCode },
            businessId,
            id: storeId,
        } = req.currentStore;
        const isValid = typeValidations(req.body, requiresEmployeeCode);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { customer, employeeCode, orderItems } = req.body;
        req.constants = {};
        if (requiresEmployeeCode) {
            await validateEmployeeCode(
                employeeCode,
                req.currentStore.businessId,
                req.currentStore.id,
            );
            const employee = await employeeDetailsQuery(employeeCode, businessId);
            const employeeDetails = {
                employeeCode,
                ...employee[0],
            };
            req.constants.employee = employeeDetails;
        }
        const uniqueProducts = [...new Set(orderItems.map((item) => item.priceId))];
        if (uniqueProducts.length !== orderItems.length) {
            res.status(409).json({
                error: 'Duplicate products found in the order.',
            });
            return;
        }

        // check if duplicate order exists and drop accordingly
        const duplicateOrder = await getDuplicateInventoryOrder({
            storeId,
            centsCustomerId: customer.id,
        });
        if (duplicateOrder) {
            const message = 'Duplicate order recently placed for customer';
            LoggerHandler('error', message, req.body);
            res.status(200).json({
                success: true,
                message,
                existingOrder: duplicateOrder,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = requestValidator;

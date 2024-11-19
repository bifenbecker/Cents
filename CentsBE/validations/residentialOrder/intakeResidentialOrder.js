const Joi = require('@hapi/joi');
const { joiValidationCommonErrHandler } = require('../validationUtil');
const ServiceOrder = require('../../models/serviceOrders');
const employeeDetailsQuery = require('../../queryHelpers/employeeDetailsQuery');
const StoreCustomer = require('../../models/storeCustomer');
const Order = require('../../models/orders');
const Store = require('../../models/store');
const BusinessSettings = require('../../models/businessSettings');
const validateEmployeeCode = require('../validateEmployeeCode');
const { getServiceOrderAndCustomerDetails } = require('../../utils/addOrderCustomerAndEmployee');

function typeValidations(inputObj, requiresEmployeeCode) {
    let schema = Joi.object().keys({
        orderTotal: Joi.number().optional().allow(null),
        totalWeight: Joi.number().required().error(joiValidationCommonErrHandler),
        notes: Joi.string().allow('', null).optional(),
        chargeableWeight: Joi.number().optional(),
        rack: Joi.string().allow('', null).optional(),
        status: Joi.string().allow('', null).optional(),
        convenienceFeeId: Joi.number().optional().allow(null),
        pickupDeliveryFee: Joi.number().optional().allow(null),
        pickupDeliveryTip: Joi.number().optional().allow(null),
        returnDeliveryFee: Joi.number().optional().allow(null),
        returnDeliveryTip: Joi.number().optional().allow(null),
        storeCustomerId: Joi.number().integer().required(),
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
                category: Joi.when('lineItemType', {
                    is: Joi.string().valid('SERVICE'),
                    then: Joi.string().valid('PER_POUND', 'FIXED_PRICE'),
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
            }),
        ),
        promotionId: Joi.number().optional().allow(null),
        creditAmount: Joi.number().optional().allow(null),
    });

    if (requiresEmployeeCode) {
        schema = schema.append({
            employeeCode: Joi.number().integer().required(),
        });
    } else {
        schema = schema.append({
            employeeCode: Joi.number().integer().optional().allow('', null),
        });
    }

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const { id } = req.params;
        const { requiresEmployeeCode } = req.currentStore.settings;
        const isValid = typeValidations(req.body, requiresEmployeeCode);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        if (req.body.status !== 'READY_FOR_PROCESSING') {
            res.status(409).json({
                error: 'Invalid status',
            });
            return;
        }
        req.constants = {};
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
        const store = await Store.query().findById(serviceOrder.storeId);
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: store.businessId,
        });
        store.settings = businessSettings;
        req.constants.residentialStore = store;
        if (requiresEmployeeCode) {
            const { employeeCode } = req.body;
            validateEmployeeCode(employeeCode, req.currentStore.businessId, req.currentStore.id);
            const employee = await employeeDetailsQuery(employeeCode, req.currentStore.businessId);
            const employeeDetails = {
                employeeCode,
                ...employee[0],
            };
            req.constants.employee = employeeDetails;
        }
        const customer = await StoreCustomer.query().findById(req.body.storeCustomerId);
        const order = await Order.query().findOne({
            orderableId: id,
            orderableType: 'ServiceOrder',
        });
        const currentOrderDetails = await getServiceOrderAndCustomerDetails(order.id);
        req.constants.currentOrderDetails = currentOrderDetails;
        req.constants.orderId = order.id;
        req.constants.customer = {
            ...customer,
            id: customer.centsCustomerId,
            storeCustomerId: customer.id,
            fullName: `${customer.firstName} ${customer.lastName}`,
            phoneNumber: customer.phoneNumber,
        };
        req.constants.serviceOrder = serviceOrder;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validate;

const Joi = require('@hapi/joi');

// Models
const Order = require('../../../../models/orders');
const Store = require('../../../../models/store');
const ServiceOrder = require('../../../../models/serviceOrders');
const CentsCustomer = require('../../../../models/centsCustomer');
const StoreCustomer = require('../../../../models/storeCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        address: Joi.object().keys({
            address1: Joi.string().required(),
            address2: Joi.string().allow(null, ''),
            centsCustomerId: Joi.number().allow(null, ''),
            city: Joi.string().required(),
            countryCode: Joi.string().allow(null, ''),
            createdAt: Joi.date().allow(null, ''),
            firstLevelSubdivisionCode: Joi.string().required(),
            googlePlacesId: Joi.string().allow(null, ''),
            id: Joi.number().allow(null, ''),
            instructions: Joi.string().allow(null, ''),
            lat: Joi.number().allow(null, ''),
            leaveAtDoor: Joi.boolean().allow(null, ''),
            lng: Joi.number().allow(null, ''),
            postalCode: Joi.string().required(),
            updatedAt: Joi.date().allow(null, ''),
        }),
        centsCustomerId: Joi.number().required(),
        deliveryCost: Joi.number().required(),
        deliveryProvider: Joi.string().required(),
        deliveryWindow: Joi.array()
            .items(Joi.number().min(0).integer().required())
            .length(2)
            .required()
            .error(
                new Error(
                    'Delivery windows are required. Each window should be greater than or equal to 0.',
                ),
            ),
        paymentToken: Joi.string().required(),
        serviceOrderId: Joi.number().required(),
        storeCustomerId: Joi.number().required(),
        storeId: Joi.number().required(),
        timingsId: Joi.number().required(),
        deliveryTip: Joi.number().allow('', null).optional(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        req.constants = req.constants || {};

        const { serviceOrderId, storeCustomerId, centsCustomerId, storeId } = req.body;

        const order = await Order.query()
            .where({
                orderableType: 'ServiceOrder',
                orderableId: serviceOrderId,
            })
            .first();
        const storeCustomer = await StoreCustomer.query().findById(storeCustomerId);
        const serviceOrder = await ServiceOrder.query().findById(serviceOrderId);
        const centsCustomer = await CentsCustomer.query().findById(centsCustomerId);
        const store = await Store.query().findById(storeId);

        req.constants.order = order;
        req.constants.storeCustomer = storeCustomer;
        req.constants.serviceOrder = serviceOrder;
        req.constants.customer = centsCustomer;
        req.constants.store = store;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

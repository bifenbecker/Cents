// Packages
const axios = require('axios');

// Models
const Business = require('../../../models/laundromatBusiness');
const Store = require('../../../models/store');

// Pipelines
const createDoorDashReturnDeliveryPipeline = require('../../../pipeline/doordash/createDoorDashReturnDeliveryPipeline');
const getDoorDashDetailsPipeline = require('../../../uow/doorDash/getDoorDashDeliveryDetails');
// Services
const { getOrderDetails } = require('../../../services/liveLink/queries/serviceOrder');
const { setPickupAndDropoffAddresses } = require('./utils');

// Events
const eventEmitter = require('../../../config/eventEmitter');
const { origins } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Generate an estimate for a DoorDash delivery
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function generateDoorDashEstimate(req, res, next) {
    try {
        const { storeId, customerAddress, netOrderTotal, deliveryTime, type } = req.body;
        const store = await Store.query().findById(storeId);
        const [pickupAddress, dropoffAddress] = setPickupAndDropoffAddresses(
            store,
            customerAddress,
            type,
        );
        const business = await Business.query().findById(store.businessId);

        const params = {
            pickup_address: pickupAddress,
            dropoff_address: dropoffAddress,
            order_value: Number(netOrderTotal * 100),
            external_business_name: business.name,
        };

        if (type === 'RETURN') {
            params.external_store_id = store.id;
            params.delivery_time = new Date(deliveryTime[1]);
        } else {
            params.pickup_time = new Date(deliveryTime[1]);
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };

        const url = `${process.env.DOORDASH_API_URL}estimates`;
        const response = await axios.post(url, params, {
            headers,
        });

        const data = await response.data;

        return res.status(200).json({
            success: true,
            deliveryTime: data.delivery_time,
            pickupTime: data.pickup_time,
            estimateFee: data.fee,
            estimateId: data.id,
            currency: data.currency,
        });
    } catch (error) {
        const errMsg =
            error &&
            error.response &&
            error.response.data &&
            error.response.data.field_errors &&
            error.response.data.field_errors.length
                ? error.response.data.field_errors[0].error
                : error;
        LoggerHandler('error', errMsg, req);
        return res.status(400).json({
            error: errMsg,
        });
    }
}

/**
 * Create a DoorDash return delivery for a service order.
 *
 * This API performs the following actions:
 *
 * 1) Based on the incoming request, create a Stripe Customer for the CentsCustomer.
 * 2) Based on the incoming request, store a new PaymentMethod for a CentsCustomer.
 * 3) Create a Delivery via DoorDash's API;
 * 4) Create an OrderDelivery model using the response from DoorDash;
 * 5) Add a new ServiceOrderItem for the Delivery service;
 * 6) Add a new ServiceReferenceItem based on the ServiceOrderItem for the Delivery service;
 * 7) Add the Delivery line item to the order based on the ServiceReferenceItem;
 * 8) Update the final cost and balance due of the order;
 * 9) Create a Stripe PaymentIntent for the delivery and store it on our end.
 * 10) Reset balanceDue to $0 since payment has been created
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createDoorDashReturnDelivery(req, res, next) {
    try {
        const { order, storeCustomer, serviceOrder, customer, store } = req.constants;
        const orderDelivery = {
            type: 'RETURN',
            deliveryWindow: req.body.deliveryWindow,
            deliveryProvider: req.body.deliveryProvider,
        };
        const payload = {
            ...req.body,
            order,
            storeCustomer,
            serviceOrder,
            customer,
            store,
            orderDelivery,
            origin: origins.LIVE_LINK,
        };
        const output = await createDoorDashReturnDeliveryPipeline(payload);

        eventEmitter.emit('doorDashOrderSubmitted', output);

        const orderDetails = await getOrderDetails(output.serviceOrder.id);

        return res.status(200).json({
            success: true,
            output,
            order: orderDetails,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieve the details for an individual DoorDash delivery
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getDoorDashDeliveryDetails(req, res, next) {
    try {
        const { id } = req.params;

        const response = await getDoorDashDetailsPipeline({ id });

        return res.json({
            success: true,
            doorDashDelivery: response.doorDashDelivery,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    generateDoorDashEstimate,
    createDoorDashReturnDelivery,
    getDoorDashDeliveryDetails,
};

const axios = require('axios');
const btoa = require('btoa');

const LaundroworksSettings = require('../../../models/laundroworksSettings');

/**
 * Process a payment via Laundroworks
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns {Object} the response
 */
async function processLaundroworksPayment(req, res, next) {
    try {
        const { body, currentStore } = req;
        const { balanceDue, serviceOrderId } = body;
        const laundroworksSettings = await LaundroworksSettings.query().findOne({
            storeId: currentStore.id,
        });
        const bearerToken = btoa(
            `${laundroworksSettings.username}:${laundroworksSettings.password}`,
        );

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${bearerToken}`,
        };
        const params = JSON.stringify({
            customer_key: laundroworksSettings.customerKey,
            location_id: laundroworksSettings.laundroworksLocationId,
            pos_number: laundroworksSettings.laundroworksPosNumber,
            command: 'sale',
            amount: balanceDue,
            transaction_id: serviceOrderId,
        });
        const url = 'https://mitechisys.com/PortalAPI/index.php/api/sales/create';

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    processLaundroworksPayment,
};

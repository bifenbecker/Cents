const axios = require('axios');

const Store = require('../models/store');
const Business = require('../models/laundromatBusiness');
const { setPickupAndDropoffAddresses } = require('../routes/live-link/doordash/utils');

class DoordashEstimateService {
    constructor(storeId, customerAddress, netOrderTotal, deliveryWindow, type) {
        this.storeId = storeId;
        this.customerAddress = customerAddress;
        this.netOrderTotal = netOrderTotal;
        this.deliveryWindow = deliveryWindow;
        this.type = type;
    }

    async estimate() {
        const store = await Store.query().findById(this.storeId);
        const [pickupAddress, dropoffAddress] = setPickupAndDropoffAddresses(
            store,
            this.customerAddress,
            this.type,
        );
        const business = await Business.query().findById(store.businessId);

        const params = {
            pickup_address: pickupAddress,
            dropoff_address: dropoffAddress,
            order_value: Number(this.netOrderTotal * 100),
            external_business_name: business.name,
        };

        if (this.type === 'RETURN') {
            params.external_store_id = store.id;
            params.delivery_time = new Date(Number(this.deliveryWindow[1]));
        } else {
            params.pickup_time = new Date(Number(this.deliveryWindow[1]));
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
        return {
            deliveryTime: data.delivery_time,
            pickupTime: data.pickup_time,
            estimateFee: data.fee,
            estimateId: data.id,
            currency: data.currency,
        };
    }
}

module.exports = DoordashEstimateService;

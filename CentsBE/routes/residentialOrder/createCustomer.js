const getBusiness = require('../../utils/getBusiness');
const customerPipeline = require('../../pipeline/customer/createCustomer');
const CustomerService = require('../../services/residential/Customer');
const eventEmitter = require('../../config/eventEmitter');

async function addCustomer(req, res, next) {
    const trx = null;
    try {
        let businessId;
        if (req.currentStore) {
            businessId = req.currentStore.businessId;
        } else {
            const business = await getBusiness(req);
            businessId = business.id;
        }

        const { storeCustomer } = await customerPipeline({
            ...req.body,
            businessId,
            storeId: req.currentStore.id,
        });

        const customerService = new CustomerService(storeCustomer);
        const pendingOrders = await customerService.hasPendingOrders();
        const customerAuthToken = customerService.generateToken();
        eventEmitter.emit('indexCustomer', storeCustomer.id);
        res.status(200).json({
            pendingOrders,
            verified: true,
            customerAuthToken,
            customer: customerService.details,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addCustomer;

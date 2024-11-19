const eventEmitter = require('../../config/eventEmitter');
const createOrderPipeline = require('../../pipeline/residentialOrder/createOrder');
const CustomerService = require('../../services/residential/Customer');

async function createOrder(req, res, next) {
    try {
        const { customerNotes, orderNotes, bags } = req.body;

        const customerService = new CustomerService(req.currentCustomer);
        await customerService.updateNotes(customerNotes || '');
        await createOrderPipeline({
            orderNotes: orderNotes || '',
            bags,
            store: req.currentStore,
            storeCustomerId: req.currentCustomer.id,
            hubId: req.currentStore.hubId,
            storeId: req.currentStore.id,
            businessId: req.currentStore.businessId,
            orderType: 'RESIDENTIAL',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
            status: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
            returnMethod: 'DELIVERY',
        });

        eventEmitter.emit('indexCustomer', req.currentCustomer.id);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createOrder;

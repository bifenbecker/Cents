const { transaction } = require('objection');
const StoreCustomer = require('../../models/storeCustomer');
const CustomerService = require('../../services/residential/Customer');
const createStoreCustomer = require('../../uow/customer/createStoreCustomer');

async function VerifyCustomer(req, res, next) {
    let trx = null;
    try {
        let businessCustomer;
        let newStoreCustomer;
        const { phoneNumber } = req.query;
        const storeId = req.currentStore.id;
        const { businessId } = req.currentStore;

        const storeCustomer = await StoreCustomer.query()
            .findOne({
                storeId,
                phoneNumber,
            })
            .withGraphFetched('centsCustomer');

        if (!storeCustomer) {
            businessCustomer = await StoreCustomer.query()
                .findOne({
                    businessId,
                    phoneNumber,
                })
                .withGraphFetched('centsCustomer');
        }

        if (businessCustomer) {
            trx = await transaction.start(StoreCustomer.knex());
            const payload = await createStoreCustomer({
                firstName: businessCustomer.firstName,
                lastName: businessCustomer.lastName,
                phoneNumber: businessCustomer.phoneNumber,
                languageId: businessId.languageId,
                storeId,
                businessId,
                centsCustomer: businessCustomer.centsCustomer,
                transaction: trx,
            });
            trx.commit();
            newStoreCustomer = payload.storeCustomer;
        }

        if (!(businessCustomer || storeCustomer)) {
            res.json({
                verified: false,
            });
            return;
        }

        const customer = storeCustomer || newStoreCustomer;
        const customerService = new CustomerService(customer);
        const pendingOrders = await customerService.hasPendingOrders();
        const customerAuthToken = customerService.generateToken();

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

module.exports = VerifyCustomer;

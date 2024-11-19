const { transaction } = require('objection');
const Store = require('../../../../models/store');
const businessServices = require('../../../../utils/getBusinessServices');
const businessProducts = require('../../../../utils/getBusinessProducts');
const TaxRate = require('../../../../models/taxRate');
const { locationType } = require('../../../../constants/constants');

const eventEmitter = require('../../../../config/eventEmitter');

async function createStoreObj(req) {
    const { businessId, ...newLocation } = req.body;
    const prices = await businessServices(businessId);
    const inventoryItems = await businessProducts(businessId);
    const printerSettings = {
        brand: 'EPSON',
        connectivityType: 'BLUETOOTH',
    };
    delete newLocation.confirmPassword;
    delete newLocation.needsRegions;
    return {
        businessId,
        ...newLocation,
        type: locationType.STANDALONE,
        prices,
        inventoryItems,
        printerSettings,
    };
}

const addLocation = async (req, res, next) => {
    let trx = null;
    try {
        const insertObject = await createStoreObj(req);
        trx = await transaction.start(Store.knex());
        const store = await Store.query(trx).insertGraphAndFetch(insertObject);
        const taxRate = await TaxRate.query(trx)
            .where('businessId', req.body.businessId)
            .select('id', 'name', 'rate', 'taxAgency', 'businessId')
            .findById(store.taxRateId);
        await trx.commit();
        eventEmitter.emit('storeCreated', store.id);
        res.status(200).json({
            success: true,
            createLocation: { ...store, taxRate, processingCapability: 'BASIC' },
            district: req.district
                ? {
                      ...req.district[0],
                  }
                : {},
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};

module.exports = exports = addLocation;

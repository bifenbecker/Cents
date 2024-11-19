const moment = require('moment-timezone');
const ServiceOrderBags = require('../../../models/serviceOrderBags');
const TeamMember = require('../../../models/teamMember');
const Store = require('../../../models/store');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

async function getOrder(req, res, next) {
    try {
        const { decodedToken } = req.locals || {};
        const { barcode } = req.query;
        if (barcode == null) throw new Error('BARCODE_REQUIRED');
        let { stores } = await TeamMember.query()
            .select('id')
            .where('userId', decodedToken.id)
            .withGraphFetched('[stores(storeQuery)]')
            .modifiers({
                storeQuery: (query) => {
                    query.select(`${Store.tableName}.id`);
                },
            })
            .first();
        stores = stores.map((store) => store.id);
        const bag = await ServiceOrderBags.query()
            .where({ barcode, isActiveBarcode: true })
            .first()
            .withGraphFetched(
                'serviceOrder(serviceOrderFilter).[store(storeFilter).[settings], hub(storeFilter), serviceOrderBags(serviceOrderBagsFilter)]',
            )
            .modifiers({
                serviceOrderFilter: (query) => {
                    query
                        .select(
                            'isProcessedAtHub',
                            'rack',
                            'id',
                            'status',
                            'orderCode',
                            'orderType',
                        )
                        .whereIn('storeId', stores)
                        .orWhereIn('hubId', stores);
                },
                storeFilter: (query) => {
                    query.select('name', 'address');
                },
                serviceOrderBagsFilter: (query) => {
                    query.select('id', 'barcode', 'barcodeStatus');
                },
            });
        if (bag === undefined) throw new Error('BARCODE_NOT_FOUND');
        if (!bag.serviceOrder) throw new Error('NO_PERMISSION');
        const timezone = bag.serviceOrder.store.settings.timeZone || 'UTC';
        res.json({
            orderType: bag.serviceOrder.orderType,
            orderCode: bag.serviceOrder.orderCode,
            orderCodeWithPrefix: getOrderCodePrefix(bag.serviceOrder),
            serviceOrderId: bag.serviceOrder.id,
            orderStatus: bag.serviceOrder.status,
            store: bag.serviceOrder.store,
            hub: bag.serviceOrder.hub,
            serviceBagId: bag.id,
            bagStatus: bag.barcodeStatus,
            statusUpdatedAt: bag ? moment(bag.updatedAt).tz(timezone).format('h:mm a') : null,
            bags: bag.serviceOrder.serviceOrderBags,
            rack: bag.serviceOrder.rack,
        });
    } catch (error) {
        switch (error.message) {
            case 'BARCODE_NOT_FOUND':
                res.status(404).json({
                    error: 'Barcode details not found',
                });
                break;
            case "Cannot read property 'id' of null":
                res.status(404).json({
                    error: 'The driver is not part of the store where this bag belongs',
                });
                break;
            case 'BARCODE_REQUIRED':
                res.status(422).json({
                    error: 'barcode param is required',
                });
                break;
            case 'NOT_AN_HUB_ORDER':
                res.status(400).json({
                    error: 'Not an hub order',
                });
                break;
            case 'NO_PERMISSION':
                res.status(404).json({
                    error: 'The driver is not part of the store where this bag belongs',
                });
                break;
            default:
                next(error);
                break;
        }
    }
}

module.exports = exports = getOrder;

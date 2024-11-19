const eventEmitter = require('../../../config/eventEmitter');
const { REPORT_TYPES } = require('../../../constants/constants');
const getBusiness = require('../../../utils/getBusiness');
const Store = require('../../../models/store');
const User = require('../../../models/user');

async function getLaborReport(req, res, next) {
    try {
        const { startDate, endDate, timeZone } = req.query;
        const allStoresCheck = req.query.allStoresCheck === 'true'; // convert a param from query string to boolean

        let stores = [];
        if (allStoresCheck) {
            const business = await getBusiness(req);
            if (!business) {
                res.status(400).json({
                    error: 'Business was not found',
                });
                return;
            }
            stores = await Store.query()
                .select('id')
                .where({ businessId: business.id })
                .orderBy('id')
                .then((items) => items.map((item) => item.id));

            if (stores.length === 0) {
                res.status(400).json({
                    error: 'Stores were not found',
                });
                return;
            }
        } else if (req.query.stores) {
            stores = Array.isArray(req.query.stores) ? req.query.stores : [req.query.stores];
        }

        const recipient = await User.query().findById(req.currentUser.id);

        const options = {
            startDate,
            endDate,
            timeZone,
            stores: stores.map(Number),
        };

        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.laborReport,
        });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLaborReport;

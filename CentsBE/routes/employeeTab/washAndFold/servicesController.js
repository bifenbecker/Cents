const logger = require('../../../lib/logger');
const {
    getLaundryServicesByCategory,
    getDryCleaningServicesByCategory,
} = require('../../../services/washServices/queries');
const ServicePrice = require('../../../models/servicePrices');
const validateServiceRequest = require('../../../validations/employeeTab/services/getIndividualServicePrice');
const serviceBelongsToStore = require('../../../validations/employeeTab/services/serviceBelongsToStore');

/**
 * Get a list of all laundry services for intake
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getLaundryCategories(req, res, next) {
    try {
        const store = req.currentStore;
        const { orderId, centsCustomerId } = req.query;
        const [fullLaundryList, categories] = await getLaundryServicesByCategory(
            store,
            orderId,
            centsCustomerId,
        );
        return res.status(200).json({
            success: true,
            laundryPrice: fullLaundryList,
            laundryCategories: categories,
        });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
}

/**
 * Get a list of all dry cleaning services for intake
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getDryCleaningCategories(req, res, next) {
    try {
        const store = req.currentStore;
        const { orderId, centsCustomerId } = req.query;
        const [fullDryCleaningList, categories] = await getDryCleaningServicesByCategory(
            store,
            orderId,
            centsCustomerId,
        );
        return res.status(200).json({
            success: true,
            dryCleaningPrice: fullDryCleaningList,
            dryCleaningCategories: categories,
        });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
}

/**
 * Get information for a single service.
 *
 * We need to check here whether the ID provided exists/is not undefined
 * and that the Service ID requested belongs to the store/business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualService(req, res, next) {
    try {
        const { servicePriceId } = req.params;
        const { businessId } = req.currentStore;

        const isValid = validateServiceRequest(req);
        if (!isValid) {
            return res.status(409).json({
                error: 'The service price ID provided is undefined',
            });
        }

        const belongsToStore = await serviceBelongsToStore(businessId, servicePriceId);
        if (!belongsToStore) {
            return res.status(409).json({
                error: 'The service provided does not belong to your business',
            });
        }

        const servicePrice = await ServicePrice.query()
            .select('servicePrices.id as servicePriceId', 'servicesMaster.*')
            .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
            .findById(servicePriceId);
        return res.json({
            success: true,
            service: servicePrice,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getLaundryCategories,
    getDryCleaningCategories,
    getIndividualService,
};

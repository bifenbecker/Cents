const Store = require('../../../../models/store');
const ServicePrices = require('../../../../models/servicePrices');
const ServiceCategory = require('../../../../models/serviceCategories');
const { getGroupedShiftTimings } = require('../../../../utils/shifts');
const DeliveryWindows = require('../../../../services/shifts/shifts');
const { SHIFT_TYPES } = require('../../../../lib/constants');
const Machines = require('../../../../models/machine');

async function getServiceCount(storeId, businessId) {
    const businessServiceCount = await ServiceCategory.query()
        .countDistinct('servicesMaster.id')
        .join('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .where('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.deletedAt', null);
    const storeServiceCount = await ServicePrices.query()
        .countDistinct('id')
        .where('storeId', storeId)
        .andWhere('deletedAt', null)
        .andWhere('isFeatured', true);
    return {
        businessCount: businessServiceCount[0].count,
        storeCount: storeServiceCount[0].count,
    };
}

const getLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deliveryWindowService = new DeliveryWindows();
        const details = await Store.query()
            .select(
                'stores.id',
                'stores.businessId',
                'stores.name',
                'stores.address',
                'stores.city',
                'stores.isBagTrackingEnabled',
                'stores.state',
                'stores.zipCode',
                'stores.phoneNumber',
                'stores.districtId',
                'stores.isHub',
                'stores.hubId',
                'stores.stripeLocationId',
                'stores.type',
                'stores.stripeTerminalId',
                'offersFullService',
                'isIntakeOnly',
                'stores.hasEsdEnabled',
                'stores.dcaLicense',
                'stores.hasCciEnabled',
                'stores.hasCashEnabled',
                'stores.hasCashDrawer',
                'stores.hasDeliveryEnabled',
                'stores.hasLaundroworksEnabled',
                'stores.commercialDcaLicense',
                'stores.hasSpyderWashEnabled',
                'stores.hasOtherPaymentMethods',
            )
            .withGraphJoined(
                `[shifts(shiftDetails).[timings(timingDetails)], settings(storeSettings),
                    assignedLocations(assignedLocationsDetails), taxRate(taxDetails), 
                    esdReaders, cciSettings, laundroworksSettings, spyderWashSettings]`,
            )
            .modifiers({
                shiftDetails: (query) => {
                    query.select('shifts.id', 'shifts.name').orderBy('shifts.name', 'ASC');
                },
                timingDetails: (query) => {
                    query
                        .select('id', 'day', 'startTime', 'endTime', 'isActive')
                        .where('isActive', true);
                },
                assignedLocationsDetails: (query) => {
                    query.select('id');
                },
                taxDetails: (query) => {
                    query.select('id', 'name', 'rate', 'taxAgency');
                },
                storeSettings: (query) => {
                    query.select('processingCapability', 'hasAppReportingAccessible');
                },
            })
            .where('stores.id', id)
            .orderBy('shifts:timings.day', 'asc')
            .first();
        const machines = await Machines.query().where('machines.storeId', details.id);
        if (details) {
            const shifts =
                (await deliveryWindowService.getShiftsByStoreId(id, SHIFT_TYPES.SHIFT)) || [];
            const mappedTimings = getGroupedShiftTimings(shifts);
            const locationsServed = details.assignedLocations.map((location) => location.id) || [];
            details.locationsServed = locationsServed;
            details.timings = mappedTimings || [];
            details.esdReader = details.esdReaders[0] || {};
            details.cciSettings = details.cciSettings || {};
            details.laundroworksSettings = details.laundroworksSettings || {};
            details.spyderWashSettings = details.spyderWashSettings || {};
            details.processingCapability = details.settings.processingCapability;
            details.hasAppReportingAccessible = details.settings.hasAppReportingAccessible;
            details.hasMachines = Boolean(machines.length);
            delete details.settings;
            delete details.shifts;
            delete details.assignedLocations;
            let serviceCounts = {};
            if (details.offersFullService) {
                serviceCounts = await getServiceCount(details.id, details.businessId);
            }
            details.businessServiceCount = Number(serviceCounts.businessCount) || 0;
            details.storeServiceCount = Number(serviceCounts.storeCount) || 0;
        }
        res.json({
            details: details || [],
            needsRegions: req.constants.needsRegions,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = getLocation;

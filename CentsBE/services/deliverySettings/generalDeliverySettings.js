const StoreSettings = require('../../models/storeSettings');
const OwnDeliverySettings = require('../../models/ownDeliverySettings');
const CentsDeliverySettings = require('../../models/centsDeliverySettings');
const ServicesMaster = require('../../models/services');
const Zone = require('../../models/zone');

const { shiftType } = require('../../constants/constants');
const { getDeliveryWindowsWithEpochDate } = require('../shifts/queries/timings');

class generalDeliverySettingsService {
    constructor(storeId) {
        this.storeId = storeId;
    }

    static getAvailableZones() {
        return Zone.query()
            .select('zones.id', 'zones.name', 'zones.zipCodes')
            .withGraphJoined('[deliveryTier(tierFilter)]')
            .modifiers({
                tierFilter: (query) => {
                    query.select('id', 'name');
                },
            })
            .whereNull('zones.deletedAt')
            .orderBy('zones.id', 'asc');
    }

    storeSettings(fields = null) {
        const fieldsToBeFetched = fields || [
            'storeSettings.id',
            'deliveryEnabled',
            'turnAroundInHours',
            'storeId',
            'deliveryPriceType',
            'recurringDiscountInPercent',
            'offerDryCleaningForDelivery',
            'dryCleaningDeliveryPriceType',
            'customLiveLinkHeader',
            'customLiveLinkMessage',
        ];
        return StoreSettings.query()
            .select(...fieldsToBeFetched)
            .withGraphJoined('[deliveryTier(tierFilter)]')
            .modifiers({
                tierFilter: (query) => {
                    query.select('id', 'name');
                },
            })
            .findOne({
                storeId: this.storeId,
            });
    }

    servicesCount() {
        return ServicesMaster.query()
            .select('servicesMaster.id')
            .leftJoin('servicePrices', 'servicePrices.serviceId', 'servicesMaster.id')
            .where('storeId', this.storeId)
            .andWhere('servicePrices.isFeatured', true)
            .andWhere('servicePrices.isDeliverable', true)
            .andWhere('isDeleted', false);
    }

    centsDeliverySettings(fields = null) {
        const fieldsToBeFetched = fields || [
            'id',
            'active',
            'storeId',
            'subsidyInCents',
            'returnOnlySubsidyInCents',
            'doorDashEnabled',
        ];
        return CentsDeliverySettings.query()
            .select(...fieldsToBeFetched)
            .findOne({
                storeId: this.storeId,
            });
    }

    ownDeliverySettings(fields = null) {
        const fieldsToBeFetched = fields || [
            'id',
            'active',
            'storeId',
            'zipCodes',
            'hasZones',
            'deliveryFeeInCents',
            'returnDeliveryFeeInCents',
            'deliveryWindowBufferInHours',
        ];
        return OwnDeliverySettings.query()
            .select(...fieldsToBeFetched)
            .findOne({
                storeId: this.storeId,
            });
    }

    getZones(ownDeliverySettingsId) {
        return this.constructor.getAvailableZones().where({ ownDeliverySettingsId });
    }

    getZipCodeSpecificZone(zipCode, ownDeliverySettingsId = null) {
        const query = ownDeliverySettingsId
            ? this.getZones(ownDeliverySettingsId)
            : this.constructor
                  .getAvailableZones()
                  .join(
                      'ownDeliverySettings',
                      'ownDeliverySettings.id',
                      'zones.ownDeliverySettingsId',
                  )
                  .where('ownDeliverySettings.storeId', this.storeId);

        return query.whereRaw('? = ANY(zones."zipCodes")', [zipCode]).first();
    }

    async getOwnDeliveryWindowsWithEpochDate({
        ownDriverDeliverySettings,
        zipCode = null,
        timeZone = 'UTC',
        validate = false,
    }) {
        const {
            hasZones,
            zipCodes: zipCodesWithoutZones,
            deliveryWindowBufferInHours: bufferInHours,
        } = ownDriverDeliverySettings;
        let { active } = ownDriverDeliverySettings || { active: false };
        let zoneId;

        // Zipcode is mandatory for this to determine if the windows are active.
        if (!zipCode) {
            return {
                dayWiseWindows: [],
                active,
            };
        }

        if (active) {
            if (hasZones) {
                const zone = await this.getZipCodeSpecificZone(zipCode);
                // Since we need to fetch zone-specifc windows
                // if the zipCode is not assigned to any zones,
                // there should be no windows available
                if (zone && zone.id) {
                    zoneId = zone.id;
                } else {
                    active = false;
                }
            } else {
                active = zipCodesWithoutZones.includes(zipCode);
            }
        }
        // No need to fetch windows if we have active as false from the above calculations.
        // active will be false because of the below cases.
        // 1. If active is false by default from delivery settings.
        // 2. If hasZones is true, and the zipCode passed is not part of any zones
        // 3. If hasZones is false, and the zipCode passed is not part of any zone less zipcodes
        if (!active) {
            return {
                dayWiseWindows: [],
                active,
            };
        }

        let dayWiseWindows = await getDeliveryWindowsWithEpochDate({
            storeId: this.storeId,
            type: shiftType.OWN_DELIVERY,
            timeZone,
            zoneId: hasZones ? zoneId : null,
            validate,
            bufferInHours,
            deliveryType: 'OWN_DRIVER',
        });
        dayWiseWindows = dayWiseWindows.filter(({ timings }) => timings.length > 0);

        // Updating the active status depending on available windows.
        active = dayWiseWindows.length > 0;
        // If there is at least one window available, then send that window
        return {
            dayWiseWindows: active ? dayWiseWindows : [],
            active,
        };
    }
}

module.exports = generalDeliverySettingsService;

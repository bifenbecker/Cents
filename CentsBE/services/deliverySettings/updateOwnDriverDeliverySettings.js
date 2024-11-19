const OwnDriverDeliverySettings = require('../../models/ownDeliverySettings');
const Zone = require('../../models/zone');
const Store = require('../../models/store');

const Base = require('../base');

const permittedParams = require('../../utils/permittedParams');
const validateZipCode = require('../../utils/validateZipcode');
const storeSettings = require('../../models/storeSettings');

class UpdateOwnDriverSettingsService extends Base {
    constructor(storeId, body) {
        super();
        this.storeId = storeId;
        this.deliverablePayload = permittedParams(body, ['deliveryTierId']);

        this.payload = permittedParams(body, [
            'zipCodes',
            'active',
            'deliveryFeeInCents',
            'returnDeliveryFeeInCents',
            'hasZones',
            'zones',
            'deliveryWindowBufferInHours',
        ]);
        this.promiseObjects = [];
        this.ownDeliverySettings = {};
    }

    async perform() {
        const { hasZones } = this.payload;
        this.ownDeliverySettings = await this.getOwnDriverSettings();

        if (!this.ownDeliverySettings || !this.ownDeliverySettings.id) {
            throw new Error('Own delivery settings is not available');
        }

        if (typeof hasZones === 'boolean') {
            this.validateZonesAndZipCodesBody();
            await this.validateZipCodes();

            if (hasZones) {
                this.setZoneCreateOrUpdatePromises();
                await this.updateStoreSettings({
                    deliveryTierId: null,
                });
            } else {
                await this.updateStoreSettings(this.deliverablePayload);
                await this.updateZonesDeliveryTierId({
                    deliveryTierId: null,
                });
            }
        }

        this.promiseObjects.push(
            OwnDriverDeliverySettings.query(this.transaction)
                .patch(this.payload)
                .where('id', this.ownDeliverySettings.id),
        );
        return Promise.all(this.promiseObjects);
    }

    async updateStoreSettings(payload) {
        await storeSettings.query(this.transaction).patch(payload).where('storeId', this.storeId);
    }

    async updateZonesDeliveryTierId(payload) {
        await Zone.query(this.transaction)
            .patch(payload)
            .where('ownDeliverySettingsId', this.ownDeliverySettings.id);
    }

    async getOwnDriverSettings() {
        return OwnDriverDeliverySettings.query().findOne({ storeId: this.storeId });
    }

    async validateZipCodes() {
        const { hasZones } = this.payload;
        const { businessId } = await Store.query()
            .select('businessId')
            .findOne({ id: this.storeId });
        const allStoreZipCodes = hasZones
            ? this.payload.zones.map(({ zipCodes }) => zipCodes).flat(Infinity)
            : this.payload.zipCodes;
        await validateZipCode(allStoreZipCodes, { id: businessId }, this.storeId);
    }

    async setZoneCreateOrUpdatePromises() {
        const { zones } = this.payload;
        delete this.payload.zones;

        const creatableZones = zones.filter(({ id }) => !id);
        const updatableZones = zones.filter(({ id }) => id);

        const creatableZonesQuery = creatableZones.map((zone) =>
            Zone.query(this.transaction).insert({
                ...permittedParams(zone, ['name', 'zipCodes', 'deliveryTierId']),
                ownDeliverySettingsId: this.ownDeliverySettings.id,
            }),
        );
        const updatableZonesQuery = updatableZones.map((zone) =>
            Zone.query(this.transaction)
                .patch(permittedParams(zone, ['name', 'zipCodes', 'deliveryTierId']))
                .where('id', zone.id),
        );

        this.promiseObjects = [
            ...this.promiseObjects,
            ...creatableZonesQuery,
            ...updatableZonesQuery,
        ];
    }

    validateZonesAndZipCodesBody() {
        const { hasZones, zones, zipCodes } = this.payload;
        if (hasZones) {
            if (!zones || !zones.length) {
                throw new Error('Zones are required');
            }
        } else {
            if (!zipCodes || !zipCodes.length) {
                throw new Error('Zip codes are required');
            }
        }
    }
}

module.exports = UpdateOwnDriverSettingsService;

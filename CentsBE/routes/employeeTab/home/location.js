// Packages
const { raw } = require('objection');

// Models
const User = require('../../../models/user');
const District = require('../../../models/district');
const BusinessSettings = require('../../../models/businessSettings');
const TipSettings = require('../../../models/tipSettings');
const TaxRate = require('../../../models/taxRate');
const CciSettings = require('../../../models/cciSetting');
const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');
const ConvenienceFee = require('../../../models/convenienceFee');

// Constants and Config
const { locationType } = require('../../../constants/constants');
const stripe = require('../../../stripe/stripeWithSecret');

/**
 * Retrieve a list of all readers for the store
 *
 * @param {String} stripeLocationId
 */
async function getStripeTerminalReaders(stripeLocationId) {
    const readers = await stripe.terminal.readers.list({
        location: stripeLocationId,
        device_type: 'bbpos_wisepos_e',
        status: 'online',
    });
    return readers.data;
}

async function getLocationDetails(req, res, next) {
    try {
        const {
            id,
            name,
            address,
            city,
            state,
            zipCode,
            phoneNumber,
            taxRateId,
            districtId,
            stripeTerminalId,
            stripeLocationId,
            isHub,
            hubId,
            isBagTrackingEnabled,
            hasEsdEnabled,
            hasCciEnabled,
            type,
            printerConnectionType,
            hasCashEnabled,
            hasCashDrawer,
            dcaLicense,
            hasLaundroworksEnabled,
            commercialDcaLicense,
            hasSpyderWashEnabled,
            hasAppReportingAccessible,
            hasOtherPaymentMethods,
        } = req.currentStore;
        let stripeReaders = [];

        if (stripeLocationId) {
            stripeReaders = await getStripeTerminalReaders(stripeLocationId);
        }

        const business = await req.currentStore.getBusiness();
        const storeSettings = await req.currentStore.getStoreSettings();
        const printerSettings = await req.currentStore.getPrinterSettings();
        const { timeZone } = storeSettings;
        const storeTheme = await req.currentStore.getStoreTheme();
        const spyderWashSettings = await req.currentStore.getSpyderWashSettings();
        let businessSettings = await BusinessSettings.query()
            .where('businessId', req.currentStore.businessId)
            .first();
        const tipSettings = await TipSettings.query()
            .where('businessId', req.currentStore.businessId)
            .first();
        const convenienceFee = await ConvenienceFee.query()
            .where('businessId', req.currentStore.businessId)
            .first();
        businessSettings = {
            ...businessSettings,
            tipSettings: tipSettings || null,
            convenienceFee: businessSettings.hasConvenienceFee ? convenienceFee : null,
        };
        const taxRate = await TaxRate.query()
            .findById(taxRateId)
            .select('id', 'name', 'rate', 'taxAgency', 'businessId');
        const cciSettings = await CciSettings.query().findOne({
            storeId: req.currentStore.id,
        });
        const scaleDeviceMap = await ScaleDeviceStoreMap.query()
            .withGraphFetched('scaleDevice')
            .where({
                storeId: req.currentStore.id,
            });
        let scaleDevices;

        if (scaleDeviceMap) {
            scaleDevices = scaleDeviceMap.map((device) => device.scaleDevice);
            scaleDevices = await Promise.all(scaleDevices);
        }

        let region;
        if (districtId) {
            // TODO test
            const district = await District.query().findById(districtId).withGraphJoined('region');
            if (district) {
                region = {
                    ...district.region,
                    district: {
                        name: district.name,
                        id: district.id,
                    },
                };
            }
        }
        let users;
        if (type !== locationType.RESIDENTIAL) {
            users = await User.query()
                .select(
                    raw('users.firstname || \' \'|| users.lastname as "fullName"'),
                    'teamMembersCheckIn.id as checkInId',
                    'teamMembers.employeeCode as employeeCode',
                )
                .join('teamMembers', 'teamMembers.userId', 'users.id')
                .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', 'teamMembers.id')
                .where('teamMembersCheckIn.storeId', id)
                .andWhere('teamMembersCheckIn.isCheckedIn', true)
                .groupBy('users.id', 'teamMembersCheckIn.id', 'teamMembers.employeeCode')
                .orderBy('teamMembersCheckIn.checkInTime');
        }

        res.json({
            store: {
                id,
                name,
                city,
                isHub,
                state,
                hubId,
                hasHub: !!hubId,
                address,
                isBagTrackingEnabled,
                zipCode,
                phoneNumber,
                stripeTerminalId,
                stripeLocationId,
                hasEsdEnabled,
                type,
                hasCciEnabled,
                printerConnectionType,
                hasCashEnabled,
                hasCashDrawer,
                storeTheme,
                dcaLicense,
                commercialDcaLicense,
                timeZone,
                hasLaundroworksEnabled,
                hasSpyderWashEnabled,
                hasAppReportingAccessible,
                hasOtherPaymentMethods,
            },
            business,
            businessSettings,
            taxRate,
            region: region || {},
            employees: users || {},
            cciSettings: cciSettings || {},
            scaleDevices: scaleDevices || {},
            storeSettings,
            printerSettings,
            spyderWashSettings: spyderWashSettings || {},
            stripeReaders,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLocationDetails;

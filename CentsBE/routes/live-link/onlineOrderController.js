const { transaction } = require('objection');
const GeneralDeliverySettingsService = require('../../services/deliverySettings/generalDeliverySettings');
const getDeliverableServices = require('../../services/liveLink/queries/DeliverableServices');
const getFeaturedServices = require('../../services/liveLink/queries/featuredServices');
const CentsCustomerAddress = require('../../models/centsCustomerAddress');
const BusinessTheme = require('../../models/businessTheme');
const { getQueryParamsforServices } = require('../../helpers/onlineOrderServicesQueryHelper');

const storeSettings = require('../../models/storeSettings');
const {
    getBusinessTheme,
    getStoreThemeByEncodedId,
} = require('../../services/liveLink/queries/stores');

const {
    shiftType,
    deliveryBufferTimeInHours,
    onDemandIntervalInMins,
    locationType,
    origins,
} = require('../../constants/constants');
const findNearStores = require('../../pipeline/pickup/nearbyStores');

const { getDeliveryWindowsWithEpochDate } = require('../../services/shifts/queries/timings');

const getCustomerInformationPipeline = require('../../pipeline/customer/information/getCustomerInformationPipeline');
const listSubscriptionsPipeline = require('../../pipeline/liveLink/listSubscriptionsPipeline');
const createOnlineOrderPipeLine = require('../../pipeline/pickup/createOnlineOrder');
const JwtService = require('../../services/tokenOperations/main');
const VoidServiceOrder = require('../../services/orders/serviceOrders/voidServiceOrder');
const { getOrderDetails } = require('../../services/liveLink/queries/serviceOrder');
const getLastOrderDetails = require('../../uow/liveLink/serviceOrders/getLastOrderDetails');
const getLatestServiceOrderDetails = require('../../uow/liveLink/serviceOrders/getLatestServiceOrderDetailsUOW');
const Preferences = require('../../models/customerPrefOptions');
const CustomerPreferences = require('../../models/customerPreferences');
const BusinessSettings = require('../../models/businessSettings');
const Store = require('../../models/store');
const StoreCustomer = require('../../models/storeCustomer');
const BusinessCustomerPreferences = require('../../models/businessCustomerPreferences');
const PreferenceOptions = require('../../models/preferenceOptions');
const CustomerPreferencesOptionSelection = require('../../models/customerPreferencesOptionSelection');
const eventEmitter = require('../../config/eventEmitter');
const getAllServices = require('../../services/liveLink/queries/allServicesAndProducts');
const getTurnAroundTimeForCategoriesPipeline = require('../../pipeline/liveLink/getTurnaroundTimeForCategoriesPipeline');
const { THEME_ERRORS } = require('../../constants/error.messages');
const defaultBusinessTheme = require('../../constants/businessOwner/defaultBusinessTheme');
const { getReturnWindowsService } = require('../../services/getReturnWindows');

async function nearStores(req, res, next) {
    try {
        const { businessId, timeZone, zipCode, lat, lng, googlePlacesId } = req.query;
        const { ownDeliveryStore, onDemandDeliveryStore, deliveryDays, turnArounds } =
            await findNearStores({
                businessId,
                timeZone,
                zipCode,
                lat,
                lng,
                googlePlacesId,
                apiVersion: req.apiVersion,
            });
        if (!ownDeliveryStore.storeId && !onDemandDeliveryStore.storeId) {
            throw new Error('STORES_NOT_AVAILABLE');
        }

        const recentCompletedStandardOrder = await getLastOrderDetails(req, res, next);
        const latestOrderDetails = await getLatestServiceOrderDetails({
            ownDeliveryStore,
            onDemandDeliveryStore,
            currentCustomerId: req.currentCustomer.id,
            recentCompletedStandardOrder,
        });
        res.status(200).json({
            success: true,
            ownDeliveryStore,
            onDemandDeliveryStore,
            recentCompletedStandardOrder,
            latestOrderDetails,
            deliveryDays,
            turnArounds,
        });
    } catch (error) {
        if (error.message === 'STORES_NOT_AVAILABLE') {
            res.status(200).json({
                ownDeliveryStore: {},
                onDemandDeliveryStore: {},
                recentCompletedStandardOrder: {},
            });
            return;
        }
        next(error);
    }
}

async function getStoreDeliverableServices(req, res, next) {
    try {
        const { storeId } = req.params;
        const { zipCode } = req.query;
        const { businessCustomer } = req.constants;
        const payload = await getQueryParamsforServices(businessCustomer, storeId, zipCode);
        payload.type = req.query.type;
        const servicesWithoutPricingStructure = await getDeliverableServices(payload);
        const services = servicesWithoutPricingStructure.map((service) => {
            if (service?.pricingStructure?.type) {
                service.serviceCategory.category = service.pricingStructure.type;
            }
            return service;
        });
        res.status(200).json({
            success: true,
            services,
        });
    } catch (error) {
        next(error);
    }
}

async function getStoreFeaturedServices(req, res, next) {
    try {
        const { storeId } = req.params;
        const { type, zipCode } = req.query;
        const { businessCustomer } = req.constants;
        let laundry = [];
        let dryCleaning = [];
        let products = [];

        const store = await Store.query().findById(storeId);
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: store.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;

        const payload = await getQueryParamsforServices(businessCustomer, storeId, zipCode);
        const services = await getFeaturedServices(payload, type);

        if (req.apiVersion >= '2.0.0' && cents20LdFlag) {
            const servicesObject = await getAllServices(store, null, req.currentCustomer.id);
            const { laundryServices, dryCleaningServices, productsList } = servicesObject;
            laundry = laundryServices;
            dryCleaning = dryCleaningServices;
            products = productsList;
        }

        res.status(200).json({
            success: true,
            services,
            laundry,
            dryCleaning,
            products,
        });
    } catch (error) {
        next(error);
    }
}

async function getDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);
        const onDemandDeliverySettings =
            (await deliverySettingsService.centsDeliverySettings()) || {};
        const ownDriverDeliverySettings =
            (await deliverySettingsService.ownDeliverySettings()) || {};
        const ownDeliveryWindows = await getDeliveryWindowsWithEpochDate({
            storeId,
            type: shiftType.OWN_DELIVERY,
            deliveryType: 'OWN_DRIVER',
        });
        const onDemandDeliveryWindows = await getDeliveryWindowsWithEpochDate({
            storeId,
            type: shiftType.CENTS_DELIVERY,
            deliveryType: 'ON_DEMAND',
        });

        ownDriverDeliverySettings.dayWiseWindows = ownDeliveryWindows;
        onDemandDeliverySettings.dayWiseWindows = onDemandDeliveryWindows;
        const generalSettings = await storeSettings.query().select('turnAroundInHours').findOne({
            storeId,
        });
        const { turnAroundInHours } = generalSettings || {};
        res.status(200).json({
            success: true,
            ownDriverDeliverySettings,
            onDemandDeliverySettings,
            deliveryBufferTimeInHours,
            onDemandIntervalInMins,
            turnAroundTime: turnAroundInHours || null,
        });
    } catch (error) {
        next(error);
    }
}

async function getLatestCustomerAddress(req, res, next) {
    try {
        const { id } = req.currentCustomer;
        const customerAddress = await CentsCustomerAddress.query()
            .where('centsCustomerId', id)
            .whereNull('deletedAt')
            .orderBy('updatedAt', 'desc')
            .first();
        res.status(200).json({
            success: true,
            customerAddress,
        });
    } catch (error) {
        next(error);
    }
}

async function getBusinessByCustomUrl(req, res, next) {
    try {
        const { customUrl } = req.params;
        const businessTheme = await BusinessTheme.query()
            .withGraphJoined('business')
            .where({ customUrl })
            .first();

        const business = businessTheme?.business;

        if (business) {
            res.status(200).json({
                success: true,
                business,
            });
        } else {
            res.status(400).json({
                error: THEME_ERRORS.businessUndefined,
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getReturnWindows(req, res, next) {
    const { query: payload } = req;
    try {
        const deliveryDays = await getReturnWindowsService({
            apiVersion: req.apiVersion,
            ...payload,
        });

        res.status(200).json({
            success: true,
            deliveryDays,
        });
    } catch (error) {
        res.status(400).json({
            error: error?.message,
        });
    }
}

async function getOrderInitialData(req, res, next) {
    try {
        const {
            query: { business: encodedBusiness, store: encodedStore },
            currentCustomer: centsCustomer,
        } = req;

        const centsCustomerCredentials = {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            phoneNumber: centsCustomer?.phoneNumber,
        };

        const theme = encodedStore
            ? await getStoreThemeByEncodedId(encodedStore)
            : await getBusinessTheme(encodedBusiness);

        const { businessId } = theme;

        const businessSettings = await BusinessSettings.query().findOne({
            businessId,
        });

        const savedCustomerAddresses = await CentsCustomerAddress.query()
            .where('centsCustomerId', centsCustomer.id)
            .orderBy('updatedAt', 'desc');

        const subscriptions = await listSubscriptionsPipeline({
            centsCustomer,
        });

        if (theme) {
            res.status(200).json({
                success: true,
                theme,
                businessId,
                businessSettings,
                centsCustomerCredentials,
                customerAddress:
                    savedCustomerAddresses.length !== 0 ? savedCustomerAddresses[0] : {},
                savedCustomerAddresses,
                subscriptions: subscriptions.formattedResponse,
            });
        } else {
            res.status(200).json({
                success: false,
                theme: defaultBusinessTheme,
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getSelectedBusinessTheme(req, res, next) {
    try {
        const { encodedId } = req.params;
        const theme = await getBusinessTheme(encodedId);
        if (theme) {
            res.status(200).json({
                success: true,
                theme,
            });
        } else {
            res.status(200).json({
                success: false,
                theme: defaultBusinessTheme,
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getSelectedStoreTheme(req, res, next) {
    try {
        const { encodedId } = req.params;
        const theme = await getStoreThemeByEncodedId(encodedId);
        if (theme) {
            res.status(200).json({
                success: true,
                theme,
            });
        } else {
            res.status(400).json({
                error: 'Store theme is undefined',
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getCustomerInformation(req, res, next) {
    try {
        const { id } = req.currentCustomer;
        const { storeId } = req.params;
        const { store } = req.constants;
        const { customer } = await getCustomerInformationPipeline({
            id,
            storeId,
            businessId: store.businessId,
        });
        res.status(200).json({
            success: true,
            customer,
        });
    } catch (error) {
        next(error);
    }
}

// online order creation

async function createOnlineOrder(req, res, next) {
    try {
        const {
            customerAddress,
            store,
            storeDetails: storeRecord,
            promotion,
            store: { settings },
            businessCustomer,
        } = req.constants;
        const { storeId } = req.params;
        const { body, currentCustomer } = req;
        const { isBagTrackingEnabled, type, hubId } = storeRecord;
        const response = await createOnlineOrderPipeLine({
            businessCustomer,
            orderItems: [],
            servicePriceId: body.servicePriceId,
            serviceModifierIds: body.serviceModifierIds,
            address: customerAddress,
            store,
            storeId,
            orderType: 'ONLINE',
            status: 'SUBMITTED',
            isProcessedAtHub: type === locationType.INTAKE_ONLY,
            hubId: type === locationType.INTAKE_ONLY ? hubId : null,
            businessId: store.businessId,
            ...body,
            ...currentCustomer,
            centsCustomer: currentCustomer,
            isBagTrackingEnabled,
            paymentTiming: 'POST-PAY',
            promotion,
            centsCustomerAddressId: body.customerAddressId,
            origin: origins.LIVE_LINK,
            settings,
            centsCustomerId: currentCustomer.id,
        });
        const { serviceOrder } = response;
        const jwtService = new JwtService({ id: serviceOrder.id });
        eventEmitter.emit('indexCustomer', serviceOrder.storeCustomerId);
        res.status(200).json({
            success: true,
            order: jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER),
        });
    } catch (error) {
        next(error);
    }
}

async function voidOrder(req, res, next) {
    try {
        const serviceOrderId = req.constants.order.id;
        const { isCancelSubscription } = req.query;
        const metaData = {
            origin: origins.LIVE_LINK,
            notes: req.body.notes,
            businessId: req.constants.order.businessId,
            requestedFromLiveLink: true,
            isCancelSubscription,
        };
        const voidServiceOrder = new VoidServiceOrder(serviceOrderId, metaData);
        await voidServiceOrder.execute();
        const orderDetails = await getOrderDetails(serviceOrderId);
        eventEmitter.emit('indexCustomer', orderDetails.customer.id);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

async function getPreferenceOptions(req, res, next) {
    const businessId = parseInt(req.params.businessId, 10);
    const customerId = req.currentCustomer.id;
    try {
        const preferences = await Preferences.query().where({
            businessId,
            deletedAt: null,
        });

        const choices = await CustomerPreferences.query().where({
            businessId,
            customerId,
        });
        res.status(200).json({
            success: true,
            preferences,
            choices,
        });
    } catch (error) {
        next(error);
    }
}

async function createPreferenceChoicesForCustomer(req, res, next) {
    const businessId = parseInt(req.params.businessId, 10);
    const customerId = req.currentCustomer.id;
    let trx = null;
    try {
        trx = await transaction.start(CustomerPreferences.knex());
        const newChoice = req.body;
        newChoice.customerId = customerId;
        newChoice.businessId = businessId;
        const result = await CustomerPreferences.query(trx).insert(newChoice);
        await trx.commit();
        res.status(201).json({
            success: true,
            choice: result,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

async function getBusinessSettings(req, res, next) {
    const businessId = parseInt(req.params.businessId, 10);
    try {
        const businessSettings = await BusinessSettings.query().findOne({
            businessId,
        });
        res.status(200).json({
            success: true,
            businessSettings,
        });
    } catch (error) {
        next(error);
    }
}

async function updateStoreCustomer(req, res, next) {
    let trx = null;
    const centsCustomerId = req.currentCustomer.id;
    const businessId = parseInt(req.params.businessId, 10);
    try {
        trx = await transaction.start(StoreCustomer.knex());
        const patchPayload = req.body;
        const result = await StoreCustomer.query(trx)
            .patch(patchPayload)
            .where({
                businessId,
                centsCustomerId,
            })
            .returning('*');

        if (result.length === 0) {
            await trx.rollback();
            res.status(422).json({
                error: `Failed to patch store-customer entity with businessId ${businessId} and centsCustomerId ${centsCustomerId}`,
            });
        } else {
            await trx.commit();
            res.status(201).json({
                success: true,
            });
        }

        result.forEach((storeCustomer) => {
            eventEmitter.emit('indexCustomer', storeCustomer.id);
        });
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

async function getPreferencesChoices(req, res, next) {
    const centsCustomerId = req.currentCustomer.id;
    const businessId = parseInt(req.params.businessId, 10);

    try {
        if (typeof businessId !== 'undefined' && typeof centsCustomerId !== 'undefined') {
            const [preferencesQueryResult, customerSelectionQueryResult] = await Promise.all([
                BusinessCustomerPreferences.query().where({
                    businessId,
                    deletedAt: null,
                }),
                CustomerPreferencesOptionSelection.query().where({
                    centsCustomerId,
                    deletedAt: null,
                }),
            ]);

            for (const pref of preferencesQueryResult) {
                const options = await PreferenceOptions.query()
                    .where({
                        businessCustomerPreferenceId: pref.id,
                        deletedAt: null,
                    })
                    .orderBy('value', 'asc');
                pref.options = options;

                pref.options.forEach((option) => {
                    const optionSelectionFound = customerSelectionQueryResult.find(
                        (customerSelection) => customerSelection.preferenceOptionId === option.id,
                    );
                    option.selected = !!optionSelectionFound;
                    if (option.selected) {
                        option.selectionId = optionSelectionFound.id;
                    }
                });
            }

            res.status(200).json({
                success: true,
                preferences: preferencesQueryResult,
            });
        } else {
            res.status(400).json({
                error: 'invalid businessId or customerId params',
            });
        }
    } catch (e) {
        next(e);
    }
}

async function updatePreferenceOptionSelection(req, res, next) {
    let trx = null;
    const selectionId = parseInt(req.params.id, 10);
    const { newOptionId } = req.body;
    try {
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const queryResponse = await CustomerPreferencesOptionSelection.query().patchAndFetchById(
            selectionId,
            { preferenceOptionId: newOptionId },
        );

        await trx.commit();

        if (!queryResponse) {
            res.status(422).json({
                error: `No customer selection with id  ${selectionId} found`,
            });
        } else {
            res.status(201).json({
                success: true,
                selection: queryResponse,
            });
        }
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

async function createPreferenceOptionSelection(req, res, next) {
    const centsCustomerId = req.currentCustomer.id;
    let trx = null;

    try {
        const { preferenceOptionId } = req.body;
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const queryResponse = await CustomerPreferencesOptionSelection.query(trx).insertAndFetch({
            centsCustomerId,
            preferenceOptionId,
        });

        await trx.commit();
        res.status(201).json({
            success: true,
            selection: queryResponse,
        });
    } catch (e) {
        if (trx) {
            trx.rollback(e);
        }
        next(e);
    }
}

async function deletePreferenceOptionSelection(req, res, next) {
    let trx = null;
    try {
        const id = parseInt(req.params.id, 10);
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const selection = await CustomerPreferencesOptionSelection.query(trx)
            .findById(id)
            .patch({
                deletedAt: new Date().toISOString(),
                isDeleted: true,
            })
            .returning('*');

        await trx.commit();

        if (!selection) {
            res.status(422).json({
                error: `No existing customerPreferencesOptionSelection with id ${id}`,
            });
        } else {
            res.status(200).json({
                success: true,
                selection,
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

/**
 * Retrieve the proper turnaround time for each category type belonging to a store
 *
 * In order to retrieve the proper turnaround times, we need to do the following:
 *
 * 1) Get the turnaround time for DRY_CLEANING ServiceCategoryType
 * 2) Get the turnaround time for the Wash and Fold / PER_POUND category
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getTurnaroundTimeForCategories(req, res, next) {
    try {
        const { businessId } = req.query;
        const output = await getTurnAroundTimeForCategoriesPipeline({ businessId });
        const { washAndFoldTurnaroundTime, dryCleaningTurnaroundTime } = output;

        return res.json({
            success: true,
            washAndFoldTurnaroundTime,
            dryCleaningTurnaroundTime,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getStoreDeliverableServices,
    getDeliverySettings,
    nearStores,
    getStoreFeaturedServices,
    getLatestCustomerAddress,
    getCustomerInformation,
    getBusinessByCustomUrl,
    getOrderInitialData,
    getSelectedBusinessTheme,
    getSelectedStoreTheme,
    createOnlineOrder,
    voidOrder,
    getPreferenceOptions,
    createPreferenceChoicesForCustomer,
    getBusinessSettings,
    updateStoreCustomer,
    getPreferencesChoices,
    updatePreferenceOptionSelection,
    createPreferenceOptionSelection,
    deletePreferenceOptionSelection,
    getTurnaroundTimeForCategories,
    getReturnWindows,
};

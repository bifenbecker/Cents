const Turn = require('../../../models/turns');
const { getMachineTurnCode, getMachineNamePrefix } = require('../../../utils/machines/machineUtil');
const {
    turnStatuses,
    serviceTypes,
    statuses,
    hubStatues,
    deviceStatuses,
} = require('../../../constants/constants');
const StoreCustomer = require('../../../models/storeCustomer');
const ServiceOrder = require('../../../models/serviceOrders');
const CentsCustomer = require('../../../models/centsCustomer');

async function getTurnPayload(payload) {
    const { serviceType, note, transaction, machineId, machineDetails, deviceId, quantity } =
        payload;
    const turnCount = await Turn.query(transaction).count();
    const { count } = turnCount[0];
    const { storeId, model, machinePricings } = machineDetails;
    const prefix = getMachineNamePrefix(model);
    const reqBody = {
        serviceType,
        note,
        machineId,
        deviceId,
        storeId,
        turnCode: getMachineTurnCode(count, prefix),
        status: turnStatuses.CREATED,
        netOrderTotalInCents: machinePricings[0].price * (quantity || 1),
    };
    return reqBody;
}

async function validateStoreCustomer(storeId, payload) {
    const { businessId, transaction, centsCustomerId } = payload;
    const centsCustomer = await CentsCustomer.query(transaction).findById(centsCustomerId);
    let storeCustomer = await StoreCustomer.query(transaction)
        .where('storeId', storeId)
        .andWhere('businessId', businessId)
        .andWhere('centsCustomerId', centsCustomer.id)
        .first();
    if (!storeCustomer) {
        storeCustomer = await StoreCustomer.query(transaction)
            .insert({
                firstName: centsCustomer.firstName,
                lastName: centsCustomer.lastName,
                email: centsCustomer.email,
                phoneNumber: centsCustomer.phoneNumber,
                storeId,
                centsCustomerId: centsCustomer.id,
                businessId,
                languageId: centsCustomer.languageId,
            })
            .returning('*');
    }
    return storeCustomer;
}

async function validateServiceOrder(payload) {
    const { serviceOrderId, transaction } = payload;
    const serviceOrder = await ServiceOrder.query(transaction).findById(serviceOrderId);
    if (!serviceOrder) {
        throw new Error('Service order not found');
    }
    const validOrderStatuses = [statuses.PROCESSING, hubStatues.HUB_PROCESSING_ORDER];
    if (!validOrderStatuses.includes(serviceOrder.status)) {
        throw new Error('Can not run machine for this order');
    }
    return serviceOrder;
}

async function getStoreCustomer(payload) {
    const { storeId: customerStoreId } = await validateServiceOrder(payload);
    const storeCustomer = await validateStoreCustomer(customerStoreId, payload);
    return storeCustomer;
}

async function createTurnUow(payload) {
    const { serviceType, technicianName, transaction, userId, origin, activePairing } = payload;
    let storeCustomer;
    const newPayload = payload;
    const turnPayload = await getTurnPayload(payload);
    switch (serviceType) {
        case serviceTypes.TECHNICAL_SERVICE:
            turnPayload.technicianName = technicianName;
            break;
        case serviceTypes.CUSTOMER_SERVICE:
            storeCustomer = await validateStoreCustomer(turnPayload.storeId, payload);
            turnPayload.storeCustomerId = storeCustomer.id;
            break;
        case serviceTypes.FULL_SERVICE:
            storeCustomer = await getStoreCustomer(payload);
            turnPayload.storeCustomerId = storeCustomer.id;
            if (!activePairing) {
                turnPayload.status = turnStatuses.COMPLETED;
                turnPayload.completedAt = new Date();
            }
            break;
        default:
            break;
    }

    turnPayload.userId = userId;
    turnPayload.origin = origin;
    const createdTurn = await Turn.query(transaction).insert(turnPayload);

    newPayload.turnId = createdTurn.id;
    newPayload.turn = createdTurn;
    newPayload.deviceStatus = deviceStatuses.IN_USE;
    return newPayload;
}

module.exports = {
    createTurnUow,
};

const { getMachineTurnCode } = require('../../../utils/machines/machineUtil');
const { turnStatuses, serviceTypes, deviceStatuses } = require('../../../constants/constants');
const StoreCustomer = require('../../../models/storeCustomer');
const Turn = require('../../../models/turns');
const eventEmitter = require('../../../config/eventEmitter');

async function createSelfServeTurnUow(payload) {
    const {
        transaction,
        origin,
        centsCustomerId,
        centsCustomer,
        machineDetails,
        quantity,
        deviceId,
    } = payload;
    const { machinePricings, store } = machineDetails;
    const newPayload = payload;
    let storeCustomer = await StoreCustomer.query(transaction).findOne({
        centsCustomerId,
        storeId: store.id,
        businessId: store.businessId,
    });
    if (!storeCustomer) {
        storeCustomer = await StoreCustomer.query(transaction).insert({
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
            phoneNumber: centsCustomer.phoneNumber,
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            businessId: store.businessId,
            languageId: centsCustomer.languageId,
        });
        eventEmitter.emit('indexCustomer', storeCustomer.id);
    }

    const turnsCount = await Turn.query(transaction).resultSize();
    const turnCreateDto = {
        storeCustomerId: storeCustomer.id,
        serviceType: serviceTypes.SELF_SERVICE,
        machineId: machineDetails.id,
        deviceId,
        storeId: store.id,
        turnCode: getMachineTurnCode(turnsCount),
        status: turnStatuses.CREATED,
        netOrderTotalInCents: machinePricings[0].price * (quantity || 1),
        origin,
    };

    const createdTurn = await Turn.query(transaction).insert(turnCreateDto);

    newPayload.turnId = createdTurn.id;
    newPayload.turn = createdTurn;
    newPayload.deviceStatus = deviceStatuses.IN_USE;
    return newPayload;
}

module.exports = {
    createSelfServeTurnUow,
};
